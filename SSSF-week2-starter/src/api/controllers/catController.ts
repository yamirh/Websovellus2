import CustomError from '../../classes/CustomError';
import {Cat, LoginUser} from '../../types/DBTypes';
import {MessageResponse} from '../../types/MessageTypes';
import {Request, Response, NextFunction} from 'express';
import {Point} from 'geojson';
import CatModel from '../models/catModel';

type MessageWithCat = MessageResponse & {data: Cat};

type BoundingBoxQuery = {
  topRight: string;
  bottomLeft: string;
};

const catGetByUser = async (
  req: Request,
  res: Response<Cat[], {user: LoginUser}>,
  next: NextFunction
) => {
  const currentUser = res.locals.user;
  try {
    const cats = await CatModel.find({owner: currentUser._id});
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGetByBoundingBox = async (
  req: Request<{}, {}, {}, BoundingBoxQuery>,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const {topRight, bottomLeft} = req.query;
    const rightCorner = topRight.split(',');
    const leftCorner = bottomLeft.split(',');

    const bounds = [
      [Number(leftCorner[1]), Number(leftCorner[0])],
      [Number(rightCorner[1]), Number(rightCorner[0])],
    ];

    const cats = await CatModel.find({
      location: {
        $geoWithin: {
          $box: bounds,
        },
      },
    })
      .select('-__v')
      .populate('owner', '-__v');

    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Partial<Cat>>,
  res: Response<MessageWithCat, {user: LoginUser}>,
  next: NextFunction
) => {
  try {
    if (res.locals.user.role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }
    const cat = await CatModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({
      message: 'Cat updated',
      data: cat,
    });
  } catch (error) {
    next(error);
  }
};

const catDeleteAdmin = async (
  req: Request<{id: string}>,
  res: Response<MessageWithCat, {user: LoginUser}>,
  next: NextFunction
) => {
  try {
    if (res.locals.user.role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }
    const cat = (await CatModel.findByIdAndDelete(
      req.params.id
    )) as unknown as Cat;
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({
      message: 'Cat deleted',
      data: cat,
    });
  } catch (error) {
    next(error);
  }
};

const catDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageWithCat, {user: LoginUser}>,
  next: NextFunction
) => {
  try {
    const cat = (await CatModel.findOneAndDelete({
      _id: req.params.id,
      owner: res.locals.user._id,
    }).select('-__v')) as unknown as Cat;

    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }

    res.json({
      message: 'Cat deleted',
      data: cat,
    });
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Partial<Omit<Cat, 'owner'>>>,
  res: Response<MessageWithCat, {user: LoginUser}>,
  next: NextFunction
) => {
  try {
    const input = {
      cat_name: req.body.cat_name,
      weight: req.body.weight,
      filename: req.body.filename,
      birthdate: req.body.birthdate,
      location: req.body.location,
    };

    const cat = (await CatModel.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: res.locals.user._id,
      },
      input,
      {new: true}
    ).select('-__v')) as unknown as Cat;

    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }

    res.json({
      message: 'Cat updated',
      data: cat,
    });
  } catch (error) {
    next(error);
  }
};

const catGet = async (
  req: Request<{id: string}>,
  res: Response<Cat>,
  next: NextFunction
) => {
  try {
    const cat = await CatModel.findById(req.params.id)
      .select('-__v')
      .populate('owner', '-__v');
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

const catListGet = async (
  req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await CatModel.find().select('-__v').populate('owner', '-__v');
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catPost = async (
  req: Request<{}, {}, Partial<Cat>>,
  res: Response<
    MessageWithCat,
    {user: LoginUser} & {
      coords: Point;
    }
  >,
  next: NextFunction
) => {
  try {
    const data = {
      cat_name: req.body.cat_name,
      weight: req.body.weight,
      filename: req.body.filename,
      birthdate: req.body.birthdate,
      location: res.locals.coords,
      owner: res.locals.user._id,
    };

    const cat = await CatModel.create({
      ...data,
      location: res.locals.coords,
      owner: res.locals.user._id,
    });

    res.json({
      message: 'Cat created',
      data: cat,
    });
  } catch (error) {
    next(error);
  }
};

export {
  catGetByUser,
  catGetByBoundingBox,
  catPutAdmin,
  catDeleteAdmin,
  catDelete,
  catPut,
  catGet,
  catListGet,
  catPost,
};
