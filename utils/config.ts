import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  baseURL: process.env.BASE_URL!
};