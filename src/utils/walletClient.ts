import Config from 'react-native-config'
import qs from 'qs'
import { getWalletApiToken } from './secureAccount'
import * as Logger from './logger'

const makeRequest = async (url: string, opts: RequestInit) => {
  Logger.breadcrumb(`request: ${opts.method} ${url}`)
  try {
    const token = await getWalletApiToken()
    if (!token) {
      Logger.breadcrumb('no token')
      throw new Error('no token')
    }

    const baseUrl = Config.WALLET_API_BASE_URL
    const route = [baseUrl, url].join('/')

    const response = await fetch(route, {
      ...opts,
      headers: {
        ...opts.headers,
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })

    if (!response.ok) {
      const errorMessage = `Bad response, status:${response.status} message:${response.statusText}`
      Logger.breadcrumb(errorMessage)
      throw new Error(errorMessage)
    }

    const text = await response.text()
    try {
      const json = JSON.parse(text)
      const data = json.data || json
      data.serverDate = response.headers.map?.date
      return data
    } catch (err) {
      return text
    }
  } catch (error) {
    Logger.breadcrumb('fetch failed')
    throw error
  }
}

export const getWallet = async (
  url: string,
  params?: unknown,
  camelCase = false,
) => {
  let fullUrl = url
  if (params) {
    fullUrl += '?'
    fullUrl += qs.stringify(params)
  }
  const opts = {
    method: 'GET',
  } as RequestInit
  if (camelCase) {
    opts.headers = { Accent: 'camel' }
  }
  return makeRequest(fullUrl, opts)
}

export const postWallet = async (
  url: string,
  data?: unknown,
  camelCase = false,
) => {
  const opts = {
    method: 'POST',
    body: data ? JSON.stringify(data) : null,
  } as RequestInit
  if (camelCase) {
    opts.headers = { Accent: 'camel' }
  }

  return makeRequest(url, opts)
}

export const deleteWallet = async (
  url: string,
  data?: unknown,
  camelCase = false,
) => {
  const opts = {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : null,
  } as RequestInit
  if (camelCase) {
    opts.headers = { Accent: 'camel' }
  }

  return makeRequest(url, opts)
}
