export enum Role {
	admin = 1,
	editors = 2,
	copyeditors = 3,
	reviewers = 4,
	users = 5,
}

export enum ArticleStatus {
	reject = 'reject',
	submission = 'submission',
	review = 'review',
	copyediting = 'copyediting',
	publishing = 'publishing',
	completed = 'completed',
}

export enum ReviewStatus {
	unassign = 'unassign',
	unassigned = 'unassigned',
	request = 'request',
	requestRejected = 'requestRejected',
	reviewing = 'reviewing',
	reviewSubmitted = 'reviewSubmitted',
	confirmed = 'confirmed',
	denied = 'denied',
}

export enum ReviewResult {
	/** Chấp nhận bản thảo => sang bước xuất bản */
	accepted = 'accepted',
	/** Yêu cầu chỉnh sửa => sang bước chỉnh sửa */
	revision = 'revision',
	/** Yêu cầu gửi lại bản thảo vì cần sửa nhiều */
	resubmit = 'resubmit',
	/** Yêu cầu gửi bản thảo sang chuyên san khác vì không phù hợp */
	resubmission = 'resubmission',
	/** Từ chối bản thảo vì sai quá nhiều */
	declined = 'declined',
	other = 'other',
}

export enum AttendedRole {
	author = 'author',
	reviewer = 'reviewer',
	editor = 'editor',
}
