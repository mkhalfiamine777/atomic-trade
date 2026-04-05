import { redirect } from 'next/navigation'

// /feed is deprecated — redirect to /explore which has the full experience (Streak + Feed)
export default function FeedPage() {
    redirect('/explore')
}
