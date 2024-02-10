import mongoose from 'mongoose';
import {User} from '../../types/DBTypes';

const userSchema = new mongoose.Schema({
  user_name: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  role: {type: String, enum: ['user', 'admin'], default: 'user'},
  password: {type: String, required: true},
});

const UserModel = mongoose.model<User & mongoose.Document>('User', userSchema);

export default UserModel;
