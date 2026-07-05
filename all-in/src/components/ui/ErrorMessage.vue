<script setup>

defineProps({
    message:{
        type:String,
        default:"Something went wrong."
    }
})

const emit = defineEmits(["retry"])

</script>

<template>

<div class="error">

<p>{{ message }}</p>

<button @click="$emit('retry')">
Retry
</button>

</div>

</template>

<style scoped>

.error{

padding:20px;

border:1px solid red;

background:#ffe5e5;

}

button{

margin-top:10px;

}

</style>