import config from '../config/config';
import IArticle from '../interfaces/article';
import INotificationGroup, { INotification } from '../interfaces/notification';
import IUser from '../interfaces/user';
import Journal from '../models/journal.model';
import NotificationGroup from '../models/notification.model';
import { validObjectID } from '../utils';

const { transporter } = config.emailTransporter;
const NAMESPACE = 'Notification Controller';

// const newNotification = (noti: INotification): Promise<INotification> => {
// 	const { title, description, visible, link, role, target } = noti;
// 	return new Promise(async (resolve, reject) => {
// 		if (!role || !target) {
// 			return reject({ status: 400, message: 'Không có đối tượng gửi thông báo' });
// 		} else if (!title) {
// 			return reject({ status: 400, message: 'Thông báo phải có tiêu đề' });
// 		}
// 		try {
// 			const notification = new NotificationGroup(noti);
// 			const result = await notification.save();
// 			resolve(result);
// 		} catch (error) {
// 			logger.error(NAMESPACE, error);
// 			reject(error);
// 		}
// 	});
// };

const makeNotiInvisible = (_id: string): Promise<INotificationGroup> => {
	return new Promise(async (resolve, reject) => {
		if (!validObjectID(_id)) {
			return reject({ status: 200, message: 'Invalid ID' });
		}
		const notification = await NotificationGroup.findById(_id).exec();
		if (!notification) {
			return reject({ status: 404, message: 'Thông báo không tồn tại' });
		}
		notification.visible = false;
		const result = await notification.save();
		resolve(result);
	});
};

const makeNotiVisible = (_id: string): Promise<INotificationGroup> => {
	return new Promise(async (resolve, reject) => {
		if (!validObjectID(_id)) {
			return reject({ status: 200, message: 'Invalid ID' });
		}
		const notification = await NotificationGroup.findById(_id).exec();
		if (!notification) {
			return reject({ status: 404, message: 'Thông báo không tồn tại' });
		}
		notification.visible = true;
		const result = await notification.save();
		resolve(result);
	});
};

// const getAllNotiForRole = (_role: number): Promise<INotification[]> => {
// 	return new Promise(async (resolve, reject) => {
// 		if (_role > 3 || _role < 0) {
// 			reject({ status: 400, message: 'Quyền không tồn tại' });
// 		}
// 		const notiArray = await NotificationGroup.find({ role: _role }).exec();
// 		resolve(notiArray);
// 	});
// };

// const getAllNotiForUser = (_id: string): Promise<INotification[]> => {
// 	return new Promise(async (resolve, reject) => {
// 		if (!validObjectID(_id)) {
// 			return reject({ status: 200, message: 'Invalid ID' });
// 		}
// 		const notiArray = await NotificationGroup.find({ target: _id }).exec();
// 		resolve(notiArray);
// 	});
// };

const newArticleSubmission = async (submission: IArticle): Promise<INotificationGroup> =>
	new Promise(async (resolve, reject) => {
		const journal = await Journal.findById(submission.journal._id).exec();
		if (!journal) {
			return reject('Số không tồn tại');
		}
		const link = '';
		const notiForEditors: INotification = {
			title: 'Một bản thảo mới vừa được nộp',
			description: `Bản thảo mới ở số ${journal.name}, chuyên san ${journal.journalGroup.name}`,
			target: journal.editors.map((j) => j._id),
			link: ``,
		};
		const notiForUsers: INotification = {
			title: 'Bản thảo của bạn đã nộp thành công!',
			description: `Bạn có thể xem quá trình xuất bản của bản thảo của bạn tại đây`,
			target: [submission.authors.main._id],
			link: ``,
		};
		/** Gửi mail cho tác gỉa */
		transporter.sendMail({
			to: submission.authors.main.email,
			subject: 'Bản thảo ' + submission.title + ' đã nộp thành công vào hệ thống và đang chờ đánh giá',
			html: `Bạn có thể xem trạng thái xuất bản của bản thảo tại đây <a href="${link}">Trạng thái</a>`,
		});
		const noti = await new NotificationGroup({
			noti: [notiForEditors, notiForUsers],
		}).save();
		const result = await noti.save();
		resolve(result);
	});

const submissionSentToReviewer = (submission: IArticle, reviewer: IUser): Promise<INotificationGroup> => {
	return new Promise(async (resolve, reject) => {
		const link = ``;
		const notiForAuthor: INotification = {
			title: 'Phản biện đã được chọn!',
			description: `Bản thảo của bạn đã được gửi đến phản biện và chờ xác nhận. \nBạn có thể xem thông tin <a href="${link}">tại đây</a>`,
			target: [submission.authors.main._id],
			link: link,
		};
		// if (!submission.detail.review.at(submission.detail.review.length - 1)) return reject('Đánh giá không tồn tại');
		const notiForReviewer: INotification = {
			title: `Bạn đã được chọn để đánh giá một bản thảo của chuyên san ${submission.journalGroup.name}`,
			description: `Hãy bắt đầu ngay tại đây`,
			target: [reviewer._id],
			link: link,
		};
		/** Gửi mail cho phản biện */
		transporter.sendMail({
			to: reviewer.email,
			subject: 'Bản thảo' + submission.title + ' đã được giao cho bạn để đánh giá. Vui lòng đăng nhập vào hệ thống để đánh giá',
			html: 'Bản thảo' + submission.title + ' đã được giao cho bạn để đánh giá. Vui lòng đăng nhập vào hệ thống để đánh giá',
		});
		/** Gửi mail cho tác gỉa */
		transporter.sendMail({
			to: submission.authors.main.email,
			subject: 'Phản biện đã nhận tin!',
			html: 'Bản thảo' + submission.title + ' đã được gửi cho phản biện để đánh giá',
		});
		const noti = await new NotificationGroup({
			noti: [notiForReviewer, notiForAuthor],
		}).save();
		resolve(noti);
	});
};

const reviewerAcceptSubmission = async (submission: IArticle, reviewer: IUser) =>
	new Promise(async (resolve, reject) => {
		const link = ``;
		const journal = await Journal.findById(submission.journal._id).exec();
		if (!journal) {
			return reject('Số không tồn tại');
		}
		const notiForAuthor: INotification = {
			title: 'Phản biện đã đồng ý!',
			description: `Bản thảo của bạn đã được phản biện đồng ý đánh giá. \nHãy chờ đợi đánh giá của phản biện nhé!`,
			target: [submission.authors.main._id],
			link: link,
		};
		const notiForEditors: INotification = {
			title: 'Phản biện đã đồng ý!',
			description: `Phản biện đã đồng ý đánh giá bản thảo ${submission.title}.`,
			target: journal.editors.map((e) => e._id),
			link: link,
		};

		// /** Gửi mail cho phản biện */
		// transporter.sendMail({
		// 	to: reviewer.email,
		// 	subject: 'Bản thảo mới cần đánh giá',
		// 	html: 'Bản thảo' + submission.title + ' đã được giao cho bạn để đánh giá. Vui lòng đăng nhập vào hệ thống để đánh giá',
		// });
		// /** Gửi mail cho tác gỉa */
		// transporter.sendMail({
		// 	to: submission.authors.main.email,
		// 	subject: 'Phản biện đã đồng ý!',
		// 	html: 'Phản biện đã đồng ý đánh giá bản thảo' + submission.title + '\nHãy chờ đợi đánh giá của phản biện nhé!',
		// });
		const noti = await new NotificationGroup({
			noti: [notiForEditors, notiForAuthor],
		}).save();
		resolve(noti);
	});

const reviewerRejectSubmission = async (submission: IArticle, reviewer: IUser) =>
	new Promise(async (resolve, reject) => {
		const link = ``;
		const journal = await Journal.findById(submission.journal._id).exec();
		if (!journal) {
			return reject('Số không tồn tại');
		}
		const notiForAuthor: INotification = {
			title: 'Phản biện không đồng ý!',
			description: `Phản biện không đồng ý đánh giá bản thảo của bạn.`,
			target: [submission.authors.main._id],
			link: link,
		};
		const notiForEditors: INotification = {
			title: 'Phản biện không đồng ý!',
			description: `Phản biện không đồng ý đánh giá bản thảo ${submission.title}.`,
			target: journal.editors.map((e) => e._id),
			link: link,
		};

		// /** Gửi mail cho phản biện */
		// transporter.sendMail({
		// 	to: reviewer.email,
		// 	subject: 'Bản thảo mới cần đánh giá',
		// 	html: 'Bản thảo' + submission.title + ' đã được giao cho bạn để đánh giá. Vui lòng đăng nhập vào hệ thống để đánh giá',
		// });
		// /** Gửi mail cho tác gỉa */
		// transporter.sendMail({
		// 	to: submission.authors.main.email,
		// 	subject: 'Phản biện đã đồng ý!',
		// 	html: 'Phản biện đã đồng ý đánh giá bản thảo' + submission.title + '\nHãy chờ đợi đánh giá của phản biện nhé!',
		// });
		const noti = await new NotificationGroup({
			noti: [notiForEditors, notiForAuthor],
		}).save();
		resolve(noti);
	});

export default {
	makeNotiVisible,
	makeNotiInvisible,
	newArticleSubmission,
	submissionSentToReviewer,
	reviewerAcceptSubmission,
	reviewerRejectSubmission,
};
