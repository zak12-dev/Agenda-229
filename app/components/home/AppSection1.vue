<script setup lang="ts">
import { ref, onMounted } from 'vue'

const posts = ref<any[]>([])
const categories = ref<any[]>([])
const selectedCategory = ref('')
const loading = ref(true)

const fetchCategories = async () => {
  categories.value = await $fetch('/api/categories')
}

const fetchPosts = async () => {
  loading.value = true
  const url = selectedCategory.value
    ? `/api/posts?categoryId=${selectedCategory.value}`
    : '/api/posts'
  posts.value = await $fetch(url)
  loading.value = false
}

onMounted(async () => {
  await fetchCategories()
  await fetchPosts()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <AppHeader />
    
    <div class="pt-32 pb-20 px-6">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header with Filters -->
        <div class="mb-12">
          <h1 class="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Inspirations & Articles
          </h1>
          <p class="text-center text-gray-600 dark:text-gray-400 mb-8">
            Découvrez notre sélection d'articles soigneusement choisis
          </p>

          <!-- Category Pills -->
          <div class="flex flex-wrap items-center justify-center gap-3">
            <button
              @click="selectedCategory = ''; fetchPosts()"
              :class="[
                'px-6 py-3 rounded-full font-semibold transition-all',
                !selectedCategory
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-indigo-700'
              ]"
            >
              Tous
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="selectedCategory = cat.id; fetchPosts()"
              :class="[
                'px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2',
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-indigo-700'
              ]"
            >
              <UIcon :name="cat.icon" class="w-4 h-4" />
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <USkeleton v-for="i in 6" :key="i" :class="`h-${[64, 80, 96][i % 3]} rounded-2xl break-inside-avoid`" />
        </div>

        <!-- Masonry Grid -->
        <div v-else-if="posts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 space-y-6">
          <article
            v-for="post in posts"
            :key="post.id"
            class="break-inside-avoid group"
          >
            <NuxtLink :to="`/blog/${post.id}`">
              <div class="h-max-[300px] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-indigo-700">
                
                <!-- Image -->
                <div class="relative overflow-hidden">
                  <NuxtImg
                    :src="post.image"
                    :alt="post.title"
                    class="w-full h-60 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <!-- Floating Category Badge -->
                  <div class="absolute top-4 left-4">
                    <span 
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg"
                      :style="{ 
                        backgroundColor: post.sub_category_id?.color + '40',
                        color: 'white',
                        border: `1px solid ${post.sub_category_id?.color}60`
                      }"
                    >
                      <UIcon :name="post.sub_category_id?.icon || 'i-heroicons-tag'" class="w-3 h-3" />
                      {{ post.sub_category_id?.name || 'Non catégorisé' }}
                    </span>
                  </div>

                  <!-- Views Badge -->
                  <div class="absolute top-4 right-4">
                    <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-medium">
                      <UIcon name="i-heroicons-eye" class="w-3 h-3" />
                      {{ post.views || 0 }}
                    </div>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-6">
                  <!-- Title -->
                  <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-purple-600 dark:group-hover:text-indigo-400 transition-colors">
                    {{ post.title }}
                  </h3>

                  <!-- Description -->
                  <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {{ post.description }}
                  </p>

                  <!-- Meta Info -->
                  <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span class="flex items-center gap-1">
                        <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                        {{ new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }}
                      </span>
                      <span class="flex items-center gap-1">
                        <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                        {{ post.readTime || '5' }} min
                      </span>
                    </div>
                    
                    <!-- Arrow Icon -->
                    <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 transition-all">
                      <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-purple-600 dark:text-indigo-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  <!-- Author (Optional) -->
                  <div v-if="post.author" class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {{ post.author.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ post.author }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Auteur</p>
                    </div>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20">
          <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center">
            <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-purple-600 dark:text-indigo-400" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Aucun article trouvé</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Aucun article ne correspond à cette catégorie pour le moment
          </p>
          <UButton 
            color="primary" 
            @click="selectedCategory = ''; fetchPosts()"
            icon="i-heroicons-arrow-path"
          >
            Voir tous les articles
          </UButton>
        </div>

        <!-- Load More Button -->
        <div v-if="!loading && posts.length > 0" class="text-center mt-12">
          <UButton 
            color="primary" 
            size="lg" 
            icon="i-heroicons-arrow-path"
            class="shadow-lg shadow-purple-500/30"
          >
            Charger plus d'articles
          </UButton>
        </div>

       
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<style scoped>
/* Personnalisation du masonry layout pour de meilleures performances */
@media (min-width: 768px) {
  .columns-2 {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .columns-3 {
    column-count: 3;
  }
}

/* Animation smooth pour les cards */
article {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Délai progressif pour l'animation */
article:nth-child(1) { animation-delay: 0.1s; }
article:nth-child(2) { animation-delay: 0.2s; }
article:nth-child(3) { animation-delay: 0.3s; }
article:nth-child(4) { animation-delay: 0.4s; }
article:nth-child(5) { animation-delay: 0.5s; }
article:nth-child(6) { animation-delay: 0.6s; }
</style>