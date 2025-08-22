export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  profilePicture?: string;
}
