export default interface PlagiarismModel {
	similarityPercent: Number | null;
	similarityFound: Number | null;
	title: String | null;
	description: String | null;
	url: String | null;
}
