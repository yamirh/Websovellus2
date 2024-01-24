import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  updateCat,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';
import {MessageResponse} from '../../types/MessageTypes';
import {Cat, User} from '../../types/DBTypes';

const catListGet = async (
  _req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await getAllCats();
    res.json(cats);
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
    const id = Number(req.params.id);
    const cat = await getCat(id);
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

const catPost = async (
  req: Request<{}, {}, Omit<Cat, 'cat_id' | 'owner' | 'coords'>>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const authUser = req.user as User;
  const [lat, lng] = res.locals.coords;
  try {
    const cat = {
      ...req.body,
      coords: {lat, lng},
      filename: req.file?.filename ?? '',
      owner: authUser.user_id,
    };
    const result = await addCat(cat);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const authUser = req.user as User;
    const id = Number(req.params.id);
    const cat = req.body;
    const result = await updateCat(cat, id, authUser);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const catDelete = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteCat(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export {catListGet, catGet, catPost, catPut, catDelete};
