<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found">

    <div class="content">

      <h1>404</h1>

      <h2>Page Not Found</h2>

      <p>
        The page you're looking for doesn't exist or has been moved.
      </p>

      <RouterLink
        to="/"
        class="home-btn"
      >
        Back to Home
      </RouterLink>

    </div>

  </main>
</template>

<style scoped>

.not-found{
    min-height:80vh;
    display:flex;
    justify-content:center;
    align-items:center;
    padding:20px;
}

.content{
    text-align:center;
}

h1{
    font-size:120px;
    color:#3b82f6;
    margin:0;
}

h2{
    color:white;
    margin-top:10px;
    font-size:34px;
}

p{
    margin-top:15px;
    color:#94a3b8;
}

.home-btn{

display:inline-block;

margin-top:35px;

padding:14px 28px;

background:#2563eb;

color:white;

text-decoration:none;

border-radius:12px;

transition:.25s;

}

.home-btn:hover{

transform:translateY(-3px);

}

</style>