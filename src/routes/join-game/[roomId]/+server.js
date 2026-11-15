import {json} from '@sveltejs/kit';

export async function POST({ request }) {
    const data = await request.json().catch(() => ({}));

    const roomId = crypto.randomUUID().slice(0,6);
    return json({success: true, roomId});
}