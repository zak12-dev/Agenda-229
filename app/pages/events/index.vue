<template>
  <div
    class="w-full bg-gradient-to-br from-orange-200 via-white to-indigo-200 py-12 sm:py-16 lg:py-20 mt-10"
  >
    <AppHeader />
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Titre -->
      <div class="text-center mb-8 sm:mb-10">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-3">
          Trouvez votre
          <span
            class="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600"
            >événement idéal</span
          >
        </h2>
        <p class="text-sm sm:text-base text-gray-600">
          Explorez plus de 10 000 événements d'exception
        </p>
      </div>

      <!-- Conteneur principal de recherche -->
      <div
        class="bg-white rounded-3xl shadow-2xl shadow-orange-100/50 p-4 sm:p-6 lg:p-8 border border-gray-200"
      >
        <!-- Barre de recherche principale -->
        <div class="relative mb-4 sm:mb-6">
          <div class="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              class="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un événement, un artiste, un lieu..."
            class="w-full pl-14 sm:pl-16 pr-4 py-4 sm:py-5 lg:py-6 text-base sm:text-lg text-gray-900 placeholder-gray-400 bg-gray-50 border-2 border-gray-300 rounded-2xl transition-all duration-300 focus:outline-none focus:bg-white focus:border-orange-300 focus:shadow-lg"
            @focus="showSuggestions = true"
          />

          <!-- Bouton effacer -->
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Filtres -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <!-- Filtre Catégorie -->
          <div class="relative">
            <button
              @click="toggleDropdown('category')"
              :class="[
                'w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all',
                activeDropdown === 'category' || selectedCategory
                  ? 'border-orange-300 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
              ]"
            >
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span class="text-sm font-medium">
                  {{ selectedCategory || 'Catégorie' }}
                </span>
              </div>
              <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': activeDropdown === 'category' }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown Catégorie -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="activeDropdown === 'category'"
                class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div class="p-2 max-h-64 overflow-y-auto">
                  <button
                    v-for="cat in categories"
                    :key="cat.id"
                    @click="selectCategory(cat.name)"
                    :class="[
                      'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                      selectedCategory === cat.name
                        ? 'bg-orange-50 text-orange-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50',
                    ]"
                  >
                    {{ cat.name }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Filtre Date -->
          <div class="relative">
            <button
              @click="toggleDropdown('date')"
              :class="[
                'w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all',
                activeDropdown === 'date' || selectedDate
                  ? 'border-orange-300 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
              ]"
            >
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span class="text-sm font-medium">
                  {{ selectedDate || 'Date' }}
                </span>
              </div>
              <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': activeDropdown === 'date' }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown Date -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="activeDropdown === 'date'"
                class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div class="p-2">
                  <button
                    v-for="date in dates"
                    :key="date"
                    @click="selectDate(date)"
                    :class="[
                      'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                      selectedDate === date
                        ? 'bg-orange-50 text-orange-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50',
                    ]"
                  >
                    {{ date }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Filtre Lieu -->
          <div class="relative">
            <button
              @click="toggleDropdown('location')"
              :class="[
                'w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all',
                activeDropdown === 'location' || selectedLocation
                  ? 'border-orange-300 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
              ]"
            >
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span class="text-sm font-medium">
                  {{ selectedLocation || 'Lieu' }}
                </span>
              </div>
              <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': activeDropdown === 'location' }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown Lieu -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="activeDropdown === 'location'"
                class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div class="p-2 max-h-64 overflow-y-auto">
                  <button
                    v-for="city in cities"
                    :key="city.id"
                    @click="selectLocation(city.nomVille)"
                    :class="[
                      'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                      selectedLocation === city.nomVille
                        ? 'bg-orange-50 text-orange-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50',
                    ]"
                  >
                    {{ city.nomVille }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Filtre Prix 
          <div class="relative">
            <button
              @click="toggleDropdown('price')"
              :class="[
                'w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all',
                activeDropdown === 'price' || selectedPrice
                  ? 'border-orange-300 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium">
                  {{ selectedPrice || 'Prix' }}
                </span>
              </div>
              <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': activeDropdown === 'price' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>-->

          <!-- Dropdown Prix 
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="activeDropdown === 'price'"
                class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div class="p-2">
                  <button
                    v-for="price in prices"
                    :key="price"
                    @click="selectPrice(price)"
                    :class="[
                      'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                      selectedPrice === price
                        ? 'bg-orange-50 text-orange-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    ]"
                  >
                    {{ price }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>-->
        </div>

        <!-- Filtres actifs & Bouton recherche -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <!-- Tags des filtres actifs -->
          <div class="flex-1 flex flex-wrap gap-2">
            <span
              v-if="selectedCategory"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
            >
              {{ selectedCategory }}
              <button @click="selectedCategory = null" class="hover:text-orange-900">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>

            <span
              v-if="selectedDate"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
            >
              {{ selectedDate }}
              <button @click="selectedDate = null" class="hover:text-orange-900">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>

            <span
              v-if="selectedLocation"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
            >
              {{ selectedLocation }}
              <button @click="selectedLocation = null" class="hover:text-orange-900">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>

            <span
              v-if="selectedPrice"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
            >
              {{ selectedPrice }}
              <button @click="selectedPrice = null" class="hover:text-orange-900">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>

            <button
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              class="text-xs text-gray-500 hover:text-gray-700 font-medium underline"
            >
              Effacer tout
            </button>
          </div>

          <!-- Bouton rechercher -->
          <button
            @click="handleSearch"
            class="sm:w-auto px-8 py-3 sm:py-3.5 bg-gradient-to-r from-orange-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Rechercher</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Quick suggestions 
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500 mb-3">Recherches populaires :</p>
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="tag in popularTags"
            :key="tag"
            @click="searchQuery = tag"
            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-full hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all"
          >
            {{ tag }}
          </button>
        </div>
      </div>-->
    </div>

    <!-- Résultats des événements -->
    <div class="px-10 mt-16 mb-16">
      <!-- Header résultats -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-5xl font-semibold text-gray-900">
            {{
              filteredEvents.length > 0
                ? `${filteredEvents.length} événements trouvés`
                : 'Événements à la une'
            }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ hasActiveFilters ? 'Résultats filtrés' : "Découvrez nos événements d'exception" }}
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
        >
          <div class="h-64 bg-gray-200"></div>
          <div class="p-6 space-y-3">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Grid des événements -->
      <div
        v-else-if="displayedEvents.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <article
          v-for="event in displayedEvents"
          :key="event.id"
          class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-300"
        >
          <NuxtLink :to="`/events/${event.id}`">
            <!-- Image avec overlay -->
            <div class="relative overflow-hidden h-64">
              <NuxtImg
                v-if="event.images?.length"
                :src="event.images[0].url"
                :alt="event.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <!-- Image fallback -->
              <img v-else src="#" class="w-full h-full object-cover" />

              <!-- Gradient overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              ></div>

              <!-- Badge Catégorie -->
              <div class="absolute top-4 left-4">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-gray-900 shadow-lg"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                  {{ event.category.name }}
                </span>
              </div>

              <!-- Date Badge -->
              <div class="absolute top-4 right-4">
                <div class="flex flex-col items-center px-3 py-2 rounded-xl bg-white shadow-lg">
                  <span class="text-2xl font-bold text-orange-600">{{
                    formatDay(event.eventDate)
                  }}</span>
                  <span class="text-xs font-medium text-gray-600 uppercase">{{
                    formatMonth(event.eventDate)
                  }}</span>
                </div>
              </div>

              <!-- Prix en bas -->
              <div class="absolute bottom-4 left-4">
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-bold text-white">
                    <template v-if="event?.price && Number(event.price) > 0">
                      {{ event.price }}Fcfa
                    </template>
                    <template v-else> Gratuit </template>
                  </span>
                  <span
                    v-if="event?.price && Number(event.price) > 0"
                    class="text-sm text-white/80"
                  >
                    / pers
                  </span>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <!-- Titre -->
              <h3
                class="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2"
              >
                {{ event.title }}
              </h3>

              <!-- Lieu -->
              <div class="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{{ event.location }}</span>
              </div>

              <!-- Description -->
              <p class="text-sm text-gray-600 line-clamp-2 mb-4">
                {{ event.description }}
              </p>

              <!-- Infos supplémentaires -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <!-- Participants -->
                <div class="flex items-center gap-1 text-xs text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>{{ event.views }} vue</span>
                </div>

                <!-- CTA Arrow -->
                <div
                  class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-indigo-600 transition-all"
                >
                  <svg
                    class="w-5 h-5 text-orange-600 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div
          class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-indigo-100 flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Aucun événement trouvé</h3>
        <p class="text-gray-600 mb-6">Aucun événement ne correspond à vos critères de recherche</p>
        <button
          @click="clearAllFilters"
          class="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Réinitialiser les filtres
        </button>
      </div>

      <!-- Boutons Voir plus / Voir moins -->
      <div class="flex justify-center gap-4 mt-10" v-if="!loading">
        <!-- Voir plus -->
        <button
          v-if="hasMoreEvents"
          @click="showMore"
          class="px-8 py-4 flex items-center gap-2 bg-white border-2 border-orange-600 text-orange-600 font-semibold rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-lg"
        >
          <span>Voir tous les événements</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- Voir moins -->
        <button
          v-if="!hasMoreEvents && canShowLess"
          @click="showLess"
          class="px-8 py-4 flex items-center gap-2 bg-white border-2 border-orange-600 text-orange-600 font-semibold rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-lg"
        >
          <span>Voir moins </span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Résultats des événements -->
  </div>
  
</template>

<script setup>
import { useNuxtApp, navigateTo } from '#app'
import { NuxtImg } from '#components'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const showSuggestions = ref(false)
const activeDropdown = ref(null)

const selectedCategory = ref(null)
const selectedDate = ref(null)
const selectedLocation = ref(null)
const selectedPrice = ref(null)
function goToEvents() {
  navigateTo('/events')
}
const categories = ref([])
const cities = ref([])

const loadingCategories = ref(false)
const loadingCities = ref(false)

const fetchCategories = async () => {
  loadingCategories.value = true

  try {
    const data = await $fetch('/api/categories')
    categories.value = data
  } catch (error) {
    console.error('Erreur catégories:', error)
  } finally {
    loadingCategories.value = false
  }
}

const fetchCities = async () => {
  loadingCities.value = true

  try {
    const data = await $fetch('/api/villes')
    console.log('Villes récupérées :', data)
    cities.value = data
  } catch (error) {
    console.error('Erreur villes:', error)
  } finally {
    loadingCities.value = false
  }
}

const dates = ["Aujourd'hui", 'Ce week-end', 'Cette semaine', 'Ce mois-ci', 'Prochainement']

const prices = ['Gratuit', 'Moins de 20€', '20€ - 50€', '50€ - 100€', 'Plus de 100€']

const popularTags = ['Concert jazz', 'Exposition art', 'Festival été', 'Théâtre Paris']

// Données fictives (Mock events)
const events = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    loading.value = true

    await Promise.all([fetchCategories(), fetchCities()])

    const data = await $fetch('/api/events/index.front', {
      method: 'GET',
      params: { q: searchQuery.value },
    })

    console.log('Retour API :', data)

    if (Array.isArray(data)) {
      events.value = data
      console.log('Événements récupérés :', events.value)
    } else {
      console.warn('Les données reçues ne sont pas un tableau :', data)
    }
  } catch (err) {
    console.error('Erreur fetch:', err)
    error.value = err
  } finally {
    loading.value = false
  }
})

searchQuery.value = route.query.q || ''

// Filtrage des événements
const filteredEvents = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return events.value
    .filter((event) => {
      if (!event.eventDate) return false

      const eventDate = new Date(event.eventDate)

      // Supprimer les événements passés
      if (eventDate < today) return false

      /* Recherche texte */
      const matchQuery =
        !searchQuery.value ||
        event.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        event.ville?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        event.category?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())

      /* Catégorie */
      const matchCategory =
        !selectedCategory.value || event.category?.name === selectedCategory.value

      /* Lieu */
      const matchLocation =
        !selectedLocation.value ||
        event.ville?.nomVille.toLowerCase() === selectedLocation.value.toLowerCase()

      /* Prix */
      const matchPrice =
        !selectedPrice.value ||
        (selectedPrice.value === 'Gratuit' && event.price === 0) ||
        (selectedPrice.value === 'Moins de 20€' && event.price < 20) ||
        (selectedPrice.value === '20€ - 50€' && event.price >= 20 && event.price <= 50) ||
        (selectedPrice.value === '50€ - 100€' && event.price > 50 && event.price <= 100) ||
        (selectedPrice.value === 'Plus de 100€' && event.price > 100)

      /* Date */
      let matchDate = true

      if (selectedDate.value) {
        const now = new Date()

        if (selectedDate.value === "Aujourd'hui") {
          matchDate = eventDate.toDateString() === now.toDateString()
        }

        if (selectedDate.value === 'Ce week-end') {
          const saturday = new Date(now)
          saturday.setDate(now.getDate() + (6 - now.getDay()))

          const sunday = new Date(saturday)
          sunday.setDate(saturday.getDate() + 1)

          matchDate = eventDate >= saturday && eventDate <= sunday
        }

        if (selectedDate.value === 'Cette semaine') {
          const endWeek = new Date(now)
          endWeek.setDate(now.getDate() + 7)

          matchDate = eventDate <= endWeek
        }

        if (selectedDate.value === 'Ce mois-ci') {
          matchDate =
            eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
        }
      }

      return matchQuery && matchCategory && matchLocation && matchPrice && matchDate
    })
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
})

const eventsPerPage = 6
const displayedCount = ref(eventsPerPage)

const displayedEvents = computed(() => {
  return filteredEvents.value.slice(0, displayedCount.value)
})

const hasMoreEvents = computed(() => {
  return displayedCount.value < filteredEvents.value.length
})

const canShowLess = computed(() => {
  return displayedCount.value > eventsPerPage
})

function showMore() {
  displayedCount.value += eventsPerPage
}

function showLess() {
  displayedCount.value = eventsPerPage
}

// Formatage date
const formatDay = (date) => {
  return new Date(date).getDate()
}

const formatMonth = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    month: 'short',
  })
}

const hasActiveFilters = computed(() => {
  return (
    selectedCategory.value || selectedDate.value || selectedLocation.value || selectedPrice.value
  )
})

const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}

const selectCategory = (catName) => {
  selectedCategory.value = catName
  activeDropdown.value = null
}

const selectDate = (date) => {
  selectedDate.value = date
  activeDropdown.value = null
}

const selectLocation = (cityName) => {
  selectedLocation.value = cityName
  activeDropdown.value = null
}

const selectPrice = (price) => {
  selectedPrice.value = price
  activeDropdown.value = null
}

const clearAllFilters = () => {
  selectedCategory.value = null
  selectedDate.value = null
  selectedLocation.value = null
  selectedPrice.value = null
  currentPage.value = 1
}

const handleSearch = () => {
  console.log('Recherche:', {
    query: searchQuery.value,
    category: selectedCategory.value,
    date: selectedDate.value,
    location: selectedLocation.value,
    price: selectedPrice.value,
  })
  // Implémenter la logique de recherche
}
watch([searchQuery, selectedCategory, selectedDate, selectedLocation, selectedPrice], () => {
  currentPage.value = 1
})
// Fermer les dropdowns au clic extérieur
if (process.client) {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('button')) {
      activeDropdown.value = null
    }
  })
}
</script>
