import mongoose from 'mongoose';
import moment from 'moment-timezone';

/**
 *  Kiểm tra xem giá trị [id] truyền vào có thuộc định dạng của ObjectId trong mongo không
 */
export const isValidObjectID = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const dateTimezone = moment.tz(Date.now(), 'Asia/Bangkok');
