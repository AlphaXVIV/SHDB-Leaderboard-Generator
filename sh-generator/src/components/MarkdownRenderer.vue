<template>
    <div v-html="compiledMarkdown"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const props = defineProps<{ content: string }>()
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
})

const compiledMarkdown = computed(() => {
    const rawHtml = md.render(props.content)
    return DOMPurify.sanitize(rawHtml)
})
</script>
