import { useEffect, useState } from 'react';
import { deepGuides } from '../data/roadmap';
import { TopicLesson } from './TopicDrawer';
export default function GuideLesson({ guideId, topicId }: { guideId: string; topicId: string }) {
  const [id, setId] = useState(topicId);
  useEffect(() => {
    const requested = new URLSearchParams(location.search).get('concept');
    if (requested && deepGuides[requested] === guideId) setId(requested);
  }, [guideId]);
  return <TopicLesson id={id} />;
}
