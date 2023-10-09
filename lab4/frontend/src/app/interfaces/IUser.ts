export interface IUser {
  id: number;
  name: string;
  birthdate: string;
  email: string;
  photoUrl?: string;
  role?: string;
  status?: string;
  friends?: string[];
  news?: string[];
  password: string;
}
