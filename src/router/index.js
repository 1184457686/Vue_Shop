import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/users.vue'
import Roles from '../components/role/roles.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/Welcome',
      children: [
        { path: '/Welcome', component: Welcome },
        { path: '/Users', component: Users },
        { path: '/Roles', component: Roles }
      ]
    }
  ]
})

// 挂在路由守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径  from  从哪个路径跳转而来   next() 是一个函数  表示放行
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
