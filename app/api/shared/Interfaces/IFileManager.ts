export interface IFileManager {
  uploadPdfFile(fileBlob: Buffer, fileNameAndPath: string): Promise<string>; 
  uploadFile(file: object, fileName: string, backup: boolean): Promise<any>;
  deleteFile(fileNameAndPath: string): Promise<boolean>;
  getFile(fileName: string): Promise<any>;
}
