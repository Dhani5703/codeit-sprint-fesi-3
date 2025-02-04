import React, { useState } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
//import { useInfiniteQuery } from '@tanstack/react-query';
//import type { QueryFunctionContext } from '@tanstack/react-query';
import instance from '@/api/axiosInstance';
import { SortOption, RegionOption, SubRegionOption } from '@/types/reviewType';
import { PlanDataWithCategory } from '@/types/plans';
import Tabs from '@/components/plans/tab/Tabs';
import RenderTabContent from '@/components/plans/RenderTabContent';
import { useCursorInfiniteScroll } from '@/hooks/useCursorInfiniteScroll';
interface PlanListData {
  planCount: number;
  planList: PlanDataWithCategory[];
  nextCursor: number | null;
}

interface PlanListResponse {
  success: boolean;
  message: string;
  data: PlanListData;
}

interface HomeProps {
  initialPlans: PlanDataWithCategory[];
  initialCursor: number | null;
}

const Home: NextPage<HomeProps> = ({ initialPlans, initialCursor }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionOption | null>(
    null,
  );
  const [selectedSubRegion, setSelectedSubRegion] =
    useState<SubRegionOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('달램핏');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null,
  );
  const [selectedSort, setSelectedSort] = useState<SortOption | null>(null);

  const { plans, loaderRef, isFetchingNextPage } = useCursorInfiniteScroll({
    initialPlans,
    initialCursor,
    selectedCategory,
    selectedSubCategory,
    selectedRegion,
    selectedSubRegion,
    selectedSort,
  });

  return (
    <div className="mx-auto px-4 py-2">
      <Tabs
        tabs={[{ category: '달램핏' }, { category: '워케이션' }]}
        defaultTab="달램핏"
        onTabChange={(category) => setSelectedCategory(category)}
        renderContent={(category) => (
          <div className="mt-4">
            <RenderTabContent
              category={category}
              plans={plans}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedSubRegion={selectedSubRegion}
              setSelectedSubRegion={setSelectedSubRegion}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
            />
          </div>
        )}
      />
      <div ref={loaderRef} className="h-12 text-center">
        {isFetchingNextPage && 'Loading more...'}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const res = await instance.get<PlanListResponse>(
      `/api/plans?cursor=0&size=10&sort=default&categoryId=1`,
      {
        headers: {
          Cookie: req.headers.cookie || '',
        },
      },
    );
    const data = res.data;
    const initialPlans: PlanDataWithCategory[] = data.data.planList.map(
      (item) => ({ ...item }),
    );
    const nextCursor = data.data.nextCursor;
    return {
      props: {
        initialPlans,
        initialCursor: nextCursor !== undefined ? nextCursor : null,
      },
    };
  } catch (error) {
    console.error('초기 데이터 로딩 실패:', error);
    return {
      props: {
        initialPlans: [],
        initialCursor: null,
      },
    };
  }
};

export default Home;
