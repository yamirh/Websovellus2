import {
  addUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../models/userModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcryptjs';
import {User} from '../../types/DBTypes';
import {MessageResponse} from '../../types/MessageTypes';

const salt = bcrypt.genSaltSync(12);

const userListGet = async (
  _req: Request,
  res: Response<User[]>,
  next: NextFunction
) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<User>,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const user = await getUser(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
  req: Request<{}, {}, Omit<User, 'user_id' | 'role'>>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const encryptedPassword = bcrypt.hashSync(req.body.password, salt);
    const user = req.body;
    const data = {
      ...user,
      password: encryptedPassword,
      role: 'user',
    };
    const result = await addUser(data);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const userPut = async (
  req: Request<{id: string}, {}, User>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const authUser = req.user as User;
    if (authUser && authUser.role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }

    const user = req.body;
    const id = Number(req.params.id);
    const result = await updateUser(user, id);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const userPutCurrent = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const newUserData = req.body;
    const userId = (req.user as User)?.user_id || 0;
    const result = await updateUser(newUserData, userId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const userDelete = async (
  req: Request<{id: string}, {}, User>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const authUser = req.user as User;
    if (authUser && authUser.role !== 'admin') {
      throw new CustomError('Admin only', 403);
    }

    const id = Number(req.params.id);
    if (!id) {
      throw new CustomError('No user', 400);
    }

    const result = await deleteUser(id);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const authUser = req.user as User;
  try {
    if (!authUser.user_id) {
      throw new CustomError('No user', 400);
    }

    const result = await deleteUser(authUser.user_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const checkToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    next(new CustomError('token not valid', 403));
  } else {
    res.json(req.user);
  }
};

export {
  userListGet,
  userGet,
  userPost,
  userPut,
  userPutCurrent,
  userDelete,
  userDeleteCurrent,
  checkToken,
};
