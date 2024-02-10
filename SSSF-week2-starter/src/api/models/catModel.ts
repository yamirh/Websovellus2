import mongoose from 'mongoose';
import {Cat} from '../../types/DBTypes';

const catSchema = new mongoose.Schema({
  cat_name: {type: String, required: true},
  weight: {type: Number},
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  filename: {type: String},
  birthdate: {type: Date},
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

const CatModel = mongoose.model<Cat & mongoose.Document>('Cat', catSchema);

export default CatModel;
