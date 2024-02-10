import {Request, Response, NextFunction} from 'express';
import {LoginUser, User, UserInput, UserOutput} from '../../types/DBTypes';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import {MessageResponse} from '../../types/MessageTypes';
import bcrypt from 'bcryptjs';

type MessageWithUser = MessageResponse & {data: UserOutput};

const salt = bcrypt.genSaltSync(12);

const userListGet = async (
  _req: Request,
  res: Response<User[]>,
  next: NextFunction
) => {
  try {
    const users = await userModel.find().select('_id user_name email');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const userGet = async (
  req: Request<{id: string}>,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('_id user_name email');

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
  req: Request<{}, {}, UserInput>,
  res: Response<MessageWithUser>,
  next: NextFunction
) => {
  try {
    const data = {
      user_name: req.body.user_name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt),
    };

    const user = await userModel.create(data);

    res.status(200).json({
      message: 'User created',
      data: {
        _id: user._id,
        user_name: user.user_name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const userPutCurrent = async (
  req: Request<{}, {}, UserInput>,
  res: Response<MessageWithUser, {user: LoginUser}>,
  next: NextFunction
) => {
  try {
    const authUser = res.locals.user;
    if (!authUser) {
      throw new CustomError('No user found', 404);
    }

    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, salt);
    }

    const user = await userModel
      .findByIdAndUpdate(authUser._id, req.body, {new: true})
      .select('-__v');

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.json({
      message: 'User updated',
      data: {
        _id: user._id,
        user_name: user.user_name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response<MessageWithUser, {user: LoginUser}>,
  next: NextFunction
) => {
  try {
    const authUser = res.locals.user;
    if (!authUser?._id) {
      throw new CustomError('No current user', 404);
    }

    const user = (await userModel.findByIdAndDelete(
      authUser._id
    )) as unknown as User;

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.json({
      message: 'User deleted',
      data: {
        _id: user._id,
        user_name: user.user_name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const checkToken = (
  req: Request,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    const user = res.locals.user as UserOutput;
    if (!user) {
      throw new CustomError('No user found', 404);
    }
    res.json({
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

export {
  userListGet,
  userGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};
