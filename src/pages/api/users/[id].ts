import type { NextApiRequest, NextApiResponse } from 'next';

/** api/users/[id]
 * GET:  returns user data by id (Admin Only)
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  //   const userID =  parseInt(id as string)

  //   console.log(req.cookies)
  res.status(200).json({ name: '' });
}