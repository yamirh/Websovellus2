import express from 'express';
import {
  checkToken,
  userDelete,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPut,
  userPutCurrent,
} from '../controllers/userController';
import passport from '../../passport';
import {body, param} from 'express-validator';
import {validationErrorHandler} from '../../middlewares';

const router = express.Router();

router
  .route('/')
  .get(userListGet)
  .post(
    body('user_name').isLength({min: 3}).escape(),
    body('email').isEmail().normalizeEmail().escape(),
    body('password').isLength({min: 5}).escape(),
    validationErrorHandler,
    userPost
  )
  .put(
    passport.authenticate('jwt', {session: false}),
    body('user_name').isLength({min: 3}).optional().escape(),
    body('email').isEmail().normalizeEmail().optional().escape(),
    body('password').isLength({min: 5}).optional().escape(),
    validationErrorHandler,
    userPutCurrent
  )
  .delete(passport.authenticate('jwt', {session: false}), userDeleteCurrent);

router.get(
  '/token',
  passport.authenticate('jwt', {session: false}),
  checkToken
);

router
  .route('/:id')
  .get(param('id').isInt(), validationErrorHandler, userGet)
  .put(
    passport.authenticate('jwt', {session: false}),
    param('id').isInt(),
    body('user_name').isLength({min: 3}).escape(),
    body('email').isEmail().normalizeEmail().escape(),
    body('password').isLength({min: 5}).escape(),
    validationErrorHandler,
    userPut
  )
  .delete(
    passport.authenticate('jwt', {session: false}),
    param('id').isInt(),
    validationErrorHandler,
    userDelete
  );

export default router;
