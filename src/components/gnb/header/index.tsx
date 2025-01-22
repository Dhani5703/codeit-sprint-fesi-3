import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/images/title.png';
import GNBItem from '../item';
import { UserData } from '@/pages/user/[username]';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/router';

interface GNBHeaderProps {
  response?: {
    data: UserData;
    message: string;
    success: boolean;
  };
}

function GNBHeader({ response }: GNBHeaderProps) {
  const router = useRouter();
  const nickname = response?.data?.nickname || '';
  const isLogin = useSelector((state: RootState) => state.auth.isLoggedIn);
  const hideGnbHeaderRoutes = ['/login', '/start'];
  const showGnbHeader = hideGnbHeaderRoutes.includes(router.pathname);

  return (
    <>
      {showGnbHeader || (
        <header className="invisible md:visible">
          <div className="fixed top-0 z-10 flex h-16 w-full items-center bg-white shadow-md md:flex md:h-[80px]">
            <div className="flex w-full justify-between px-5">
              <Link href={'/plans'}>
                <Image
                  width={88.33}
                  height={24.33}
                  src={logo}
                  alt="wemo-gnb-logo"
                />
              </Link>
              <div className="flex items-center">
                <ul className="flex space-x-6">
                  <GNBItem text={'홈'} path={'/plans'} />
                  {isLogin ? (
                    <>
                      <GNBItem text={'모든 리뷰'} path={'/all-reviews'} />
                      <GNBItem text={'모임 찾기'} path={'/all-meetings'} />
                      <GNBItem text={'마이페이지'} path={`/user/${nickname}`} />
                    </>
                  ) : (
                    <GNBItem text={'로그인'} path={'/start'} />
                  )}
                </ul>
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
}

export default GNBHeader;
