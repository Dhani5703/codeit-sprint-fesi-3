import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import type { QueryFunctionContext } from '@tanstack/react-query';
import { useInfiniteScrollTrigger } from '@/hooks/useInfiniteScrollTrigger';
import instance from '@/api/axiosInstance';
import { SortOption, RegionOption, SubRegionOption } from '@/types/reviewType';
import { PlanDataWithCategory } from '@/types/plans';

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

interface useCursorInfiniteScrollProps {
  initialPlans: PlanDataWithCategory[];
  initialCursor: number | null;
  selectedCategory: string;
  selectedSubCategory: string | null;
  selectedRegion: RegionOption | null;
  selectedSubRegion: SubRegionOption | null;
  selectedSort: SortOption | null;
}

export const useCursorInfiniteScroll = ({
  initialPlans,
  initialCursor,
  selectedCategory,
  selectedSubCategory,
  selectedRegion,
  selectedSubRegion,
  selectedSort,
}: useCursorInfiniteScrollProps) => {
  const fetchPlans = async ({
    pageParam = initialCursor ?? 0,
  }: QueryFunctionContext<
    (string | SubRegionOption | null)[],
    number | null
  >): Promise<PlanListData> => {
    const sortParam = selectedSort ? selectedSort.value : 'default';
    const categoryParams = selectedCategory === '달램핏' ? 1 : 2;
    const url = `/api/plans?cursor=${pageParam}&size=10&sort=${sortParam}&categoryId=${categoryParams}`;

    try {
      const response = await instance.get<PlanListResponse>(url);
      return response.data.data;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'status' in error.response &&
        error.response.status === 401 &&
        'data' in error.response &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'message' in error.response.data &&
        error.response.data.message === '만료된 토큰입니다.'
      ) {
        try {
          const responseFallback = await instance.get<PlanListResponse>(url, {
            withCredentials: false,
          });
          return responseFallback.data.data;
        } catch (fallbackError: unknown) {
          console.error('Fallback 요청 실패:', fallbackError);
          return { planCount: 0, planList: [], nextCursor: null };
        }
      }
      throw error;
    }
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<
      PlanListData,
      Error,
      InfiniteData<PlanListData>,
      (string | SubRegionOption | null)[],
      number
    >({
      queryKey: [
        'plans',
        selectedCategory,
        selectedSubCategory,
        selectedRegion,
        selectedSubRegion,
        selectedSort,
      ],
      queryFn: fetchPlans,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialData: {
        pages: [
          {
            planCount: initialPlans.length,
            planList: initialPlans,
            nextCursor: initialCursor,
          },
        ],
        pageParams: [initialCursor ?? 0],
      },
      initialPageParam: initialCursor ?? 0,
    });

  const plans = data?.pages?.flatMap((page) => page.planList) ?? [];

  const { loaderRef } = useInfiniteScrollTrigger(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return { plans, loaderRef, isFetchingNextPage };
};
