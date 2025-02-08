import { useEffect, useRef, useState } from 'react';
import useLightningMap from '@/hooks/useLightningMap';

interface LightningMapProps {
  initialMeetups: {
    lightningId: number;
    lightningName: string;
    latitude: number;
    longitude: number;
  }[];
}

const INITIAL_COORDINATE = { lat: 37.5664056, lng: 126.9778222 };

const LightningMap = ({ initialMeetups }: LightningMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { address, fetchMeetups, isInitialLoading } = useLightningMap();
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const mapCenter = useRef(INITIAL_COORDINATE);
  const [, setSelectedMeetup] = useState<string | null>(null);

  useEffect(() => {
    if (
      isInitialLoading ||
      !window.kakao ||
      !window.kakao.maps ||
      !mapRef.current
    )
      return;

    console.log('지도 초기화 시작');

    const newMap = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(
        mapCenter.current.lat,
        mapCenter.current.lng,
      ),
      level: 5,
    });

    mapInstance.current = newMap;

    // 지도 이동시 중심 좌표가 업데이트
    window.kakao.maps.event.addListener(newMap, 'dragend', () => {
      const center = newMap.getCenter();
      mapCenter.current = { lat: center.getLat(), lng: center.getLng() };
    });

    // 초기 마커 표시
    initialMeetups.forEach((meetup) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(
          meetup.latitude,
          meetup.longitude,
        ),
        map: newMap,
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedMeetup(meetup.lightningName);
        console.log(`📌 선택된 모임: ${meetup.lightningName}`);
      });
    });
  }, [isInitialLoading]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('위치 정보를 가져올 수 없습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (data) => {
      const lat = data.coords.latitude;
      const lng = data.coords.longitude;

      mapCenter.current = { lat, lng };

      if (mapInstance.current) {
        mapInstance.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
      }

      fetchMeetups(lat, lng); //내 위치 기준으로 데이터 패칭
    });
  };

  return (
    <div className="mt-4 flex w-full flex-col items-center px-4">
      <p>현재 위치 : {address}</p>

      {/* 🗺️ 지도 컨테이너 */}
      <div className="relative h-[450px] w-full max-w-[1200px] overflow-hidden rounded-xl shadow-md">
        {/* 🗺️ 지도 자체 */}
        <div ref={mapRef} className="h-full w-full" />

        {/* 📌 버튼 컨테이너 (지도 위에 오버레이) */}
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <button
            onClick={getCurrentLocation}
            className="rounded bg-blue-500 px-4 py-2 text-white shadow-md"
          >
            내 위치 가져오기
          </button>
          <button
            onClick={() =>
              fetchMeetups(mapCenter.current.lat, mapCenter.current.lng)
            }
            className="rounded bg-green-500 px-4 py-2 text-white shadow-md"
          >
            여기에서 모임 찾기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LightningMap;
