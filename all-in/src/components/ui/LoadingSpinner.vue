<script setup>

</script>

<template>
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>
</template>

<style scoped>
.loading{
    display:flex;
    flex-direction:column;
    align-items:center;
    margin:40px;
}

.spinner{
    width:40px;
    height:40px;
    border:4px solid #ddd;
    border-top:4px solid #42b883;
    border-radius:50%;
    animation:spin .8s linear infinite;
}

@keyframes spin{
    from{
        transform:rotate(0deg);
    }
    to{
        transform:rotate(360deg);
    }
}
</style>