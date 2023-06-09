import { describe, expect, it } from 'vitest'
import { HttpMethods, KubernetesUrlGenerator, toURLSearchParams } from './urlgenerator'
import { ClientOptions } from './index'

describe('KubernetesUrlGenerator', () => {
  const tests: {
    name: string
    expected: string
    input: {
      method: HttpMethods
      apiVersion: string
      kind: string
      name?: string
      namespace?: string
      params?: URLSearchParams
    }
  }[] = [
    {
      name: 'should return /api/v1/namespaces/default/configmaps/test for listing single object in namespace',
      input: {
        method: 'GET',
        apiVersion: 'v1',
        kind: 'ConfigMap',
        name: 'test',
        namespace: 'default',
      },
      expected: '/api/v1/namespaces/default/configmaps/test',
    },
    {
      name: 'should return /api/v1/namespaces/default/configmaps for listing all in namespace',
      input: {
        method: 'GET',
        apiVersion: 'v1',
        kind: 'ConfigMap',
        namespace: 'default',
      },
      expected: '/api/v1/namespaces/default/configmaps',
    },
    {
      name: 'should return /api/v1/namespaces/default/configmaps for new objects',
      input: {
        method: 'POST',
        apiVersion: 'v1',
        kind: 'ConfigMap',
        namespace: 'default',
      },
      expected: '/api/v1/namespaces/default/configmaps',
    },
    {
      name: 'should return /api/v1/nodes for listing cluster-scoped objects',
      input: {
        method: 'GET',
        apiVersion: 'v1',
        kind: 'Node',
      },
      expected: '/api/v1/nodes',
    },
    {
      name: 'should return /api/v1/namespaces/default for existing object',
      input: {
        method: 'GET',
        apiVersion: 'v1',
        kind: 'Namespace',
        name: 'default',
      },
      expected: '/api/v1/namespaces/default',
    },
    {
      name: 'should return /apis/authorization.k8s.io/v1/selfsubjectaccessreviews for ',
      input: {
        method: 'GET',
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
      },
      expected: '/apis/authorization.k8s.io/v1/selfsubjectaccessreviews',
    },
  ]

  tests.forEach((test) => {
    const subject = new KubernetesUrlGenerator()
    it(`buildEndpoint() ${test.name}`, () => {
      const result = subject.buildEndpoint(
        test.input.method,
        test.input.apiVersion,
        test.input.kind,
        test.input.namespace,
        test.input.name,
        test.input.params
      )
      expect(result).toEqual(test.expected)
    })
  })

  it('buildEndpoint() should return http://localhost:5000', () => {
    const subject = new KubernetesUrlGenerator('http://localhost:5000')
    const result = subject.buildEndpoint('GET', 'v1', 'Namespace', undefined, 'default')
    expect(result).toEqual('http://localhost:5000/api/v1/namespaces/default')
  })

  it('buildEndpoint() should return query parameters', () => {
    const subject = new KubernetesUrlGenerator()
    const params = new URLSearchParams()
    params.set('limit', '500')
    const result = subject.buildEndpoint('GET', 'v1', 'Namespace', undefined, 'default', params)
    expect(result).toEqual('/api/v1/namespaces/default?limit=500')
  })

  it('buildEndpoint() should omit certain query parameters', () => {
    const subject = new KubernetesUrlGenerator()
    const params = new URLSearchParams()
    params.set('hideManagedFields', 'true')
    const result = subject.buildEndpoint('GET', 'v1', 'Namespace', undefined, 'default', params)
    expect(result).toEqual('/api/v1/namespaces/default')
  })
})

describe('toURLSearchParams', () => {
  const tests: { name: string; options: ClientOptions; expected: string }[] = [
    {
      name: 'should return boolean',
      options: {
        hideManagedFields: true,
      },
      expected: 'hideManagedFields=true',
    },
    {
      name: 'should return number',
      options: {
        limit: 500,
      },
      expected: 'limit=500',
    },
    {
      name: 'should ignore key for undefined',
      options: {
        someKey: undefined,
      },
      expected: '',
    },
    {
      name: 'should return string',
      options: {
        someKey: 'hi Mom',
      },
      expected: 'someKey=hi+Mom',
    },
    {
      name: 'should return empty string',
      options: {
        someKey: '',
      },
      expected: 'someKey=',
    },
  ]
  tests.forEach((test) => {
    it(test.name, () => {
      const result = toURLSearchParams(test.options).toString()
      expect(result).toEqual(test.expected)
    })
  })
})
