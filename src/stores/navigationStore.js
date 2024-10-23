import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    currentPage: '',
    currentChapterIndex: 0,
    currentPageIndex: 0,
  }),
  actions: {
    setCurrentPage(page) {
      this.currentPage = page
    },
    setCurrentChapterIndex(index) {
      this.currentChapterIndex = index
    },
    setCurrentPageIndex(index) {
      this.currentPageIndex = index
    },
    changePage(direction) {
      // might need logic later
    }
  }
})

