'use client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function StageResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const stageId = params.stageId;
  const score = searchParams.get('score') || '0';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white bg-opacity-80 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Stage {stageId} Result</h1>
        <div className="text-6xl font-extrabold text-indigo-600 mb-4">{score}/100</div>
        <p className="text-lg text-gray-700 mb-8">Your Score</p>
        <Button className="w-full mb-2" onClick={() => router.push(`/stages/${stageId}`)}>
          Back to Stage
        </Button>
        <Button variant="outline" className="w-full" onClick={() => router.push('/stages')}>
          All Stages
        </Button>
      </div>
    </div>
  );
} 