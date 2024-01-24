import express, {Request} from 'express';
import {
  catDelete,
  catGet,
  catListGet,
  catPost,
  catPut,
} from '../controllers/catController';
import multer, {FileFilterCallback} from 'multer';
import {body, param} from 'express-validator';
import passport from '../../passport';
import {
  getCoordinates,
  makeThumbnail,
  validationErrorHandler,
} from '../../middlewares';

const fileFilter = (
  request: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({dest: './uploads/', fileFilter});
const router = express.Router();

router
  .route('/')
  .get(catListGet)
  .post(
    passport.authenticate('jwt', {session: false}),
    upload.single('cat'),
    makeThumbnail,
    getCoordinates,
    body('cat_name').notEmpty().escape(),
    body('birthdate').isDate(),
    body('weight').isNumeric(),
    validationErrorHandler,
    catPost
  );

router
  .route('/:id')
  .get(param('id').isInt(), validationErrorHandler, catGet)
  .put(
    passport.authenticate('jwt', {session: false}),
    param('id').isInt(),
    body('cat_name').notEmpty().optional().escape(),
    body('birthdate').optional().isDate(),
    body('weight').optional().isNumeric(),
    validationErrorHandler,
    catPut
  )
  .delete(
    passport.authenticate('jwt', {session: false}),
    param('id').isInt(),
    validationErrorHandler,
    catDelete
  );

export default router;
