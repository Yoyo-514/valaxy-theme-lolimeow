export type HitokotoSentenceType
  = | 'a'
    | 'b'
    | 'c'
    | 'd'
    | 'e'
    | 'f'
    | 'g'
    | 'h'
    | 'i'
    | 'j'
    | 'k'
    | 'l'

export interface HitokotoResponse {
  hitokoto?: string
  from?: string
  fromWho?: string | null
}

export interface FetchHitokotoOptions {
  sentenceTypes?: HitokotoSentenceType[]
  minLength?: number
  maxLength?: number
}

const HITOKOTO_API_URL = 'https://v1.hitokoto.cn/'

function appendNumberParam(searchParams: URLSearchParams, key: string, value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0)
    return

  searchParams.set(key, String(Math.floor(value)))
}

function createHitokotoUrl(options: FetchHitokotoOptions = {}) {
  const searchParams = new URLSearchParams()

  options.sentenceTypes
    ?.filter((type, index, list) => Boolean(type) && list.indexOf(type) === index)
    .forEach(type => searchParams.append('c', type))

  appendNumberParam(searchParams, 'min_length', options.minLength)
  appendNumberParam(searchParams, 'max_length', options.maxLength)

  const queryString = searchParams.toString()
  return queryString ? `${HITOKOTO_API_URL}?${queryString}` : HITOKOTO_API_URL
}

export async function fetchHitokoto(options: FetchHitokotoOptions = {}) {
  const response = await fetch(createHitokotoUrl(options))
  if (!response.ok)
    throw new Error(`Failed to fetch hitokoto: ${response.status}`)

  return await response.json() as HitokotoResponse
}
