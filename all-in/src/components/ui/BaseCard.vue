<script setup>

</script>

<template>

<div class="base-card">

<header>

<slot name="header"/>

</header>

<main>

<slot/>

</main>

<footer>

<slot name="footer"/>

</footer>

</div>

</template>

<style scoped>

.base-card{

padding:20px;

border-radius:10px;

border:1px solid #ddd;

margin:20px 0;

}

header{

margin-bottom:15px;

font-weight:bold;

}

footer{

margin-top:15px;

}

</style>