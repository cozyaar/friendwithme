import { redirect } from 'next/navigation';

// /chat → redirect to /bookings (Messages tab is there)
export default function ChatIndex() {
  redirect('/bookings');
}
