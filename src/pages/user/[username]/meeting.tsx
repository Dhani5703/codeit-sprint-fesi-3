import MeetingCard from '@/components/mypage/MeetingCard';
// import Button from '@/components/shared/Button';
import { useEffect, useState } from 'react';
import { StaticImageData } from 'next/image';
import axios from 'axios';
import NoData from '@/components/mypage/NoData';
import MypageLayout from '@/components/mypage/MypageLayout';

const BASE_URL = process.env.NEXT_PUBLIC_API_KEY;

export interface MeetingData {
  email: string;
  meetingId: number;
  meetingName: string;
  meetingImagePath: StaticImageData;
  category: string;
  memberCount: number;
}

export default function MyMeeting() {
  const [activeTab, setActiveTab] = useState<'tabLeft' | 'tabRight'>('tabLeft');
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  //유저 정보 전역 데이터로 수정하기@@@
  const useremail = 'test@test.com'; // 현재 사용자의 이메일

  //최초 렌더링 시에만 api 호출
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/my_meeting`,
          // {
          //   headers: {
          //     Authorization: ``, // JWT 토큰
          //   },
          // },
        );
        const userMeetingData = response.data.data.meetingList;
        const userMeetingCount = response.data.data.meetingCount;

        console.log('들어온 데이터 수', userMeetingCount);

        setMeetings(userMeetingData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  console.log('업데이트 데이터', meetings);

  const createdMeetings = meetings.filter((meet) => meet.email === useremail);
  const joinedMeetings = meetings.filter((meet) => meet.email !== useremail);
  console.log('내가 만든 모임데이터', createdMeetings);
  console.log('참여한 데이터', joinedMeetings);

  const meetingData =
    activeTab === 'tabLeft' ? joinedMeetings : createdMeetings;

  return (
    <MypageLayout
      headerProps="모임 페이지"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabsTitle={[
        { key: 'tabLeft', label: '참여한 모임' },
        { key: 'tabRight', label: '내가 만든 모임' },
      ]}
    >
      <section className="mt-5 flex flex-col items-center sm:w-[350px] md:w-[700px] lg:w-[1050px]">
        <ul className="flex flex-col gap-y-10 md:flex-row md:flex-wrap md:gap-10">
          {meetingData.length > 0 ? (
            meetingData.map((meet, index) => (
              <MeetingCard
                key={index}
                meetingData={meet}
                useremail={useremail}
              />
            ))
          ) : (
            <NoData comment="모임이" toPage="모임 둘러보기" />
          )}
        </ul>
      </section>
    </MypageLayout>
  );
}
