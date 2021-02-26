/*
 * Prudentide
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license MIT
 */

import express from 'express'
import dereference from 'json-schema-deref-sync'
import { useResponseWrapper } from './utils/express.mjs'
import { withBindings } from './middleware/bindings.mjs'
import { withFileUpload } from './middleware/upload.mjs'
import {
  withToken,
  withUserProfile
} from './middleware/auth.mjs'
import {
  withBodyValidation,
  withQueryValidation,
  withFilesValidation,
  withParamsValidation
} from './middleware/validate.mjs'
import {
  filterFromParameters,
  convertRequestBodyContent
} from './utils/schema.mjs'

const wrappers = {
  get: 200,
  put: 200,
  post: 201,
  delete: 204,
  patch: 200,
  head: 204
}

const middlewareFactory = (schema, auth) => {
  // FIXME: This naively expects a root security element
  const getSecurity = (method, path) => !schema.paths[path][method]?.security
  const getQueryParameters = filterFromParameters(schema, 'query')
  const getPathParameters = filterFromParameters(schema, 'path')
  const getRequestFiles = convertRequestBodyContent(schema, 'multipart/form-data')
  const getRequestBody = convertRequestBodyContent(schema, 'application/json')

  return (method, path) => {
    const oapath = path.replace(/:([^/]+)/g, '{$1}')
    const security = getSecurity(method, oapath)
    const requestFiles = getRequestFiles(method, oapath)
    const requestBody = getRequestBody(method, oapath)
    const queryParameters = getQueryParameters(method, oapath)
    const queryParams = getPathParameters(method, oapath)
    const middleware = []

    /* istanbul ignore else */
    if (security) {
      middleware.push(withToken)
      middleware.push(withUserProfile)
    }

    /* istanbul ignore else */
    if (requestFiles) {
      middleware.push(withFileUpload())
      middleware.push(withFilesValidation(requestFiles))
    }

    /* istanbul ignore else */
    if (requestBody) {
      middleware.push(withBodyValidation(requestBody))
    }

    /* istanbul ignore else */
    if (queryParameters) {
      middleware.push(withQueryValidation(queryParameters))
    }

    /* istanbul ignore else */
    if (queryParams) {
      middleware.push(withParamsValidation(queryParams))
      middleware.push(withBindings(path))
    }

    return middleware
  }
}

export const createRouter = ({
  schema
}) => {
  const derefed = dereference(dereference(schema)) // NOTE: Twice because of recursion
  const createMiddleware = middlewareFactory(derefed)

  const wrap = (router, method) => (path, ...args) => {
    const middleware = args.slice(0, -1)
    const callback = args[args.length - 1]
    const status = wrappers[method]

    router[method](
      path,
      ...createMiddleware(method, path),
      ...middleware,
      useResponseWrapper(callback, status)
    )
  }

  return new Proxy(express.Router(), {
    get: (router, methodName) => wrappers[methodName]
      ? wrap(router, methodName)
      : router[methodName]
  })
}
