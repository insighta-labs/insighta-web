export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  role: "admin" | "analyst";
}

export interface Profile {
  id: string;
  name: string;
  gender: "male" | "female";
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string;
}

export interface PaginationLinks {
  self: string;
  next: string | null;
  prev: string | null;
}

export interface ProfileListResponse {
  status: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  links: PaginationLinks;
  data: Profile[];
}

export interface ApiError {
  status: "error";
  message: string;
}
