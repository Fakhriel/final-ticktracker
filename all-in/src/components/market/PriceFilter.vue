<script setup>
const emit = defineEmits(["change"]);

function update(event){
    emit("change",Number(event.target.value))
}
</script>

<template>

<select @change="update">

<option value="0">All Price</option>

<option value="100">Above 100</option>

<option value="1000">Above 1000</option>

<option value="10000">Above 10000</option>

</select>

</template>

<style scoped>

select{
padding:10px;
margin-bottom:20px;
}

</style>