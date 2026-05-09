import { NextResponse } from 'next/server';

const initialData = {
  count_dislikes: 12,
  count_likes: 10,
  status: 'like',
};

export async function GET() {
  return NextResponse.json(initialData);
}

export async function PUT(request: Request) {
  const data = initialData;

  const { status: newStatus } = await request.json();

  const changeLikeCount = ([likeChange, dislikeChange]: [number, number]) => {
    data.count_likes += likeChange;
    data.count_dislikes += dislikeChange;
  };

  if (newStatus === null) {
    //обнулить лайк или дизлайк
    changeLikeCount(data.status === 'like' ? [-1, 0] : [0, -1]);
  } else {
    //поменять
    changeLikeCount(newStatus === 'like' ? [1, -1] : [-1, 1]);
  }

  data.status = newStatus;

  const response = NextResponse.json(data);

  await new Promise(resolve => setTimeout(resolve, 1000));
  return response;
}
