import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from '../App.vue'

describe('App', () => {
  it('mounts and renders the navbar', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div>home</div>' } }],
    })

    const wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
      },
    })

    await router.isReady()

    // The navbar (AppNavbar) should always render, it's the one element
    // present on every route.
    expect(wrapper.find('nav').exists()).toBe(true)
  })
})