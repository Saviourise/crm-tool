export const PIPELINE_DEALS_QUERY_KEY = ['pipeline', 'deals'] as const
export const PIPELINE_PIPELINES_QUERY_KEY = ['pipeline', 'pipelines'] as const
export const PIPELINE_SAVED_VIEWS_QUERY_KEY = ['pipeline', 'saved-views'] as const

export const pipelineQueryKeys = {
  deals: PIPELINE_DEALS_QUERY_KEY,
  pipelines: PIPELINE_PIPELINES_QUERY_KEY,
  savedViews: PIPELINE_SAVED_VIEWS_QUERY_KEY,
  dealDetail: (id: string) => ['pipeline', 'deals', id, 'detail'] as const,
  dealContacts: (id: string) => ['pipeline', 'deals', id, 'contacts'] as const,
  dealActivity: (id: string) => ['pipeline', 'deals', id, 'activity'] as const,
}
