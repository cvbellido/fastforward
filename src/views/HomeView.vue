<template>
  <div :class="['app-container', isDarkMode ? 'dark-mode' : 'light-mode']">
    <!-- Main Content -->
    <v-container fluid class="pa-6">
      <div class="top-shell mb-4">
        <div class="top-shell__logo">
          <img class="header-logo" :src="headerLogoSrc" alt="FastForward Logistics logo" />
        </div>

        <div class="top-shell__divider"></div>

        <div class="top-band">
          <div class="controls-panel controls-panel--left">
            <v-menu v-model="isMonthMenuOpen" location="bottom" :offset="8">
              <template #activator="{ props }">
                <button
                  type="button"
                  class="manual-select month-select"
                  :class="{ 'manual-select--open': isMonthMenuOpen }"
                  v-bind="props"
                >
                  <span class="manual-select__content">
                    <v-icon size="22">mdi-calendar</v-icon>
                    <span class="manual-select__value">{{ selectedMonthTitle }}</span>
                    <v-icon class="manual-select__menu-icon" size="22">
                      {{ isMonthMenuOpen ? 'mdi-menu-up' : 'mdi-menu-down' }}
                    </v-icon>
                  </span>
                </button>
              </template>

              <v-list class="manual-select__menu" min-width="260">
                <v-list-item
                  v-for="item in monthOptions"
                  :key="item.value"
                  :title="item.title"
                  :disabled="item.disabled"
                  @click="selectMonth(item.value, item.disabled)"
                />
              </v-list>
            </v-menu>
          </div>

          <div class="controls-panel controls-panel--right">
            <span class="theme-label">{{ isDarkMode ? 'Dark' : 'Light' }}</span>
            <v-switch
              :model-value="!isDarkMode"
              inset
              hide-details
              color="primary"
              class="theme-switch"
              @update:model-value="toggleTheme"
            ></v-switch>
          </div>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <v-row class="mb-8 stats-row">
        <!-- Shipment Volume Card -->
        <v-col cols="12" sm="6" md="3">
          <div class="stat-card">
            <v-icon class="stat-card-icon stat-card-icon--volume" size="24">mdi-truck-outline</v-icon>
            <div class="stat-label">Shipment Volume</div>
            <div class="stat-value">{{ selectedData.shipment_volume.toLocaleString() }}</div>
            <div class="stat-change" :class="{ positive: shipmentVolumeChange >= 0 }">
              {{ shipmentVolumeChange >= 0 ? '+' : '' }}{{ shipmentVolumeChange.toFixed(1) }}%
            </div>
          </div>
        </v-col>

        <!-- On-Time Delivery Rate Card -->
        <v-col cols="12" sm="6" md="3">
          <div class="stat-card">
            <v-icon class="stat-card-icon stat-card-icon--delivery" size="24">mdi-check-circle-outline</v-icon>
            <div class="stat-label">On-Time Rate</div>
            <div class="stat-value">{{ selectedData.on_time_delivery_rate.toFixed(1) }}%</div>
            <div class="stat-change" :class="{ positive: onTimeDeliveryChange >= 0 }">
              {{ onTimeDeliveryChange >= 0 ? '+' : '' }}{{ onTimeDeliveryChange.toFixed(2) }}%
            </div>
          </div>
        </v-col>

        <!-- Open Exceptions Card -->
        <v-col cols="12" sm="6" md="3">
          <div class="stat-card">
            <v-icon class="stat-card-icon stat-card-icon--exceptions" size="24">mdi-alert-circle-outline</v-icon>
            <div class="stat-label">Open Exceptions</div>
            <div class="stat-value">{{ selectedData.open_exceptions }}</div>
            <div class="stat-change" :class="{ positive: exceptionsChange <= 0 }">
              {{ exceptionsChange <= 0 ? '-' : '+' }}{{ Math.abs(exceptionsChange).toFixed(0) }}
            </div>
          </div>
        </v-col>

        <!-- Best Region Card -->
        <v-col cols="12" sm="6" md="3">
          <div class="stat-card">
            <v-icon class="stat-card-icon stat-card-icon--region" size="24">mdi-map-marker-outline</v-icon>
            <div class="stat-label">Best Region</div>
            <div class="stat-value stat-value--region">{{ bestRegion.region }}</div>
            <div class="stat-change">{{ bestRegion.performance.toFixed(2) }}%</div>
          </div>
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row class="mb-8">
        <!-- Shipment Volume Bar Chart -->
        <v-col cols="12" md="7">
          <v-card class="premium-card monthly-volume-card">
            <v-card-item class="pb-2 chart-card-header">
              <v-card-title class="chart-card-title">Monthly Shipment Volume</v-card-title>
              <v-card-subtitle class="chart-card-subtitle">{{ currentYear }} YTD through Sep · Oct-Dec pending</v-card-subtitle>
            </v-card-item>
            <v-card-text class="chart-container monthly-volume-chart">
              <Bar :data="shipmentVolumeChartData" :options="barChartOptions" />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Regional Performance Donut Chart -->
        <v-col cols="12" md="5">
          <v-card class="premium-card regional-performance-card">
            <v-card-item class="pb-2 chart-card-header">
              <v-card-title class="chart-card-title">Regional Performance</v-card-title>
              <v-card-subtitle class="chart-card-subtitle">Average on-time delivery mix across active regions</v-card-subtitle>
            </v-card-item>
            <v-card-text class="chart-container chart-container--donut d-flex justify-center align-center">
              <div style="width: 100%; max-width: 300px;">
                <Doughnut :data="regionalPerformanceChartData" :options="donutChartOptions" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Advanced Charts Row -->
      <v-row>
        <!-- On-Time Delivery Rate Line Chart -->
        <v-col cols="12" md="6">
          <v-card class="premium-card">
            <v-card-item class="pb-2 chart-card-header">
              <v-card-title class="chart-card-title">On-Time Delivery Trend</v-card-title>
              <v-card-subtitle class="chart-card-subtitle">{{ currentYear }} YTD through Sep · Oct-Dec pending</v-card-subtitle>
            </v-card-item>
            <v-card-text class="chart-container trend-chart">
              <Line :data="onTimeDeliveryChartData" :options="lineChartOptions" />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Open Exceptions Area Chart -->
        <v-col cols="12" md="6">
          <v-card class="premium-card">
            <v-card-item class="pb-2 chart-card-header">
              <v-card-title class="chart-card-title">Exceptions Trend</v-card-title>
              <v-card-subtitle class="chart-card-subtitle">{{ currentYear }} YTD through Sep · Oct-Dec pending</v-card-subtitle>
            </v-card-item>
            <v-card-text class="chart-container trend-chart">
              <Line :data="exceptionsChartData" :options="lineChartOptions" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Regional Performance Breakdown Table -->
      <v-row class="mt-8">
        <v-col cols="12">
          <v-card class="premium-card">
            <v-card-item class="pb-2 chart-card-header">
              <v-card-title class="chart-card-title">Regional Performance Breakdown</v-card-title>
              <v-card-subtitle class="chart-card-subtitle">Ranked on-time performance and operating status by region</v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <v-table class="regional-table">
                <thead>
                  <tr>
                    <th class="text-left">Region</th>
                    <th class="text-center">On-Time Rate</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(performance, region) in sortedRegionalData" :key="region">
                    <td class="font-weight-medium text-left">{{ region }}</td>
                    <td class="text-center">
                      <v-chip
                        :color="isLightMode ? undefined : getPerformanceColor(performance)"
                        :style="getPerformanceChipStyle(performance)"
                        variant="flat"
                        label
                      >
                        {{ performance.toFixed(2) }}%
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <v-chip
                        :color="isLightMode ? undefined : getPerformanceColor(performance)"
                        :style="getPerformanceChipStyle(performance)"
                        variant="flat"
                        label
                      >
                        {{ performance >= 90 ? 'On Track' : performance >= 85 ? 'Watch' : 'At Risk' }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-8">
        <v-col cols="12">
          <v-card class="premium-card tracking-card">
            <v-card-item class="pb-2 chart-card-header">
              <v-card-title class="chart-card-title">Shipment Tracking</v-card-title>
              <v-card-subtitle class="chart-card-subtitle">Live fleet board with lane status</v-card-subtitle>
            </v-card-item>
            <v-card-text class="tracking-card-body">
              <div class="tracking-layout">
                <div class="tracking-sidebar">
                  <div class="tracking-sidebar__header">
                    <div>
                      <div class="tracking-summary__label">Selected Truck</div>
                      <div class="tracking-summary__title">{{ selectedTruck.name }}</div>
                    </div>
                    <v-chip
                      class="tracking-status-chip"
                      :color="isLightMode ? undefined : selectedTruck.statusColor"
                      :style="selectedTruckStatusChipStyle"
                      variant="flat"
                      label
                    >
                      <v-icon start size="16">{{ selectedTruck.statusIcon }}</v-icon>
                      {{ selectedTruck.status }}
                    </v-chip>
                  </div>

                  <v-menu v-model="isTruckMenuOpen" location="bottom" :offset="8">
                    <template #activator="{ props }">
                      <button
                        type="button"
                        class="manual-select manual-select--inside-label truck-select"
                        :class="{ 'manual-select--open': isTruckMenuOpen }"
                        v-bind="props"
                      >
                        <span class="manual-select__label">Select Truck</span>
                        <span class="manual-select__content">
                          <v-icon size="22">mdi-truck-delivery-outline</v-icon>
                          <span class="manual-select__value">{{ selectedTruckTitle }}</span>
                          <v-icon class="manual-select__menu-icon" size="22">
                            {{ isTruckMenuOpen ? 'mdi-menu-up' : 'mdi-menu-down' }}
                          </v-icon>
                        </span>
                      </button>
                    </template>

                    <v-list class="manual-select__menu" min-width="300">
                      <v-list-item
                        v-for="item in truckOptions"
                        :key="item.value"
                        :title="item.title"
                        @click="selectTruck(item.value)"
                      />
                    </v-list>
                  </v-menu>

                  <div class="tracking-metrics">
                    <div class="tracking-metric-card">
                      <v-icon size="18">mdi-speedometer</v-icon>
                      <div>
                        <span class="tracking-summary__label">Current Speed</span>
                        <strong>{{ selectedTruck.speed }}</strong>
                      </div>
                    </div>
                    <div class="tracking-metric-card">
                      <v-icon size="18">mdi-package-variant-closed</v-icon>
                      <div>
                        <span class="tracking-summary__label">Load</span>
                        <strong>{{ selectedTruck.load }}</strong>
                      </div>
                    </div>
                    <div class="tracking-metric-card">
                      <v-icon size="18">mdi-map-clock-outline</v-icon>
                      <div>
                        <span class="tracking-summary__label">Last Update</span>
                        <strong>{{ selectedTruck.lastUpdate }}</strong>
                      </div>
                    </div>
                    <div class="tracking-metric-card">
                      <v-icon size="18">mdi-flag-checkered</v-icon>
                      <div>
                        <span class="tracking-summary__label">Route Progress</span>
                        <strong>{{ selectedTruck.completion }}%</strong>
                      </div>
                    </div>
                  </div>

                  <div class="tracking-timeline">
                    <div class="tracking-summary__label tracking-summary__label--section">Tracking</div>
                    <div class="tracking-timeline__item" v-for="stop in selectedTruck.stops" :key="`${selectedTruck.id}-${stop.code}-timeline`">
                      <div class="tracking-timeline__marker">
                        <v-icon size="14">mdi-map-marker</v-icon>
                      </div>
                      <div>
                        <div class="tracking-timeline__code">{{ stop.code }}</div>
                        <div class="tracking-timeline__city">{{ stop.city }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="tracking-layout__divider" aria-hidden="true"></div>

                <div class="tracking-map-panel">
                  <div class="tracking-map-toolbar">
                    <div class="tracking-map-search" :style="selectedTruckChipStyle">
                      <v-icon size="18">mdi-truck-fast-outline</v-icon>
                      <span>{{ selectedTruck.checkpoint }}</span>
                    </div>
                  </div>

                  <div class="tracking-map-wrap">
                    <svg class="tracking-map" viewBox="0 0 1100 420" role="img" aria-label="Shipment tracking map with truck routes">
                      <defs>
                        <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stop-color="#1a73e8" />
                          <stop offset="100%" stop-color="#34a853" />
                        </linearGradient>
                      </defs>
                      <rect x="0" y="0" width="1100" height="420" rx="24" class="map-bg"></rect>
                      <g class="map-grid">
                        <path class="map-road map-road--major" d="M80 330 C220 240, 360 190, 510 175 C660 160, 810 170, 1000 120"></path>
                        <path class="map-road" d="M140 80 C250 130, 330 160, 430 220 C500 260, 610 290, 760 315"></path>
                        <path class="map-road" d="M760 70 C700 150, 665 205, 650 300"></path>
                        <path class="map-road" d="M250 120 C210 210, 205 265, 225 340"></path>
                      </g>
                      <g class="map-water">
                        <path d="M865 235 C915 250, 965 288, 1035 350 L1035 390 L835 390 C835 330, 845 285, 865 235 Z"></path>
                      </g>
                      <g class="map-areas">
                        <rect x="95" y="75" width="180" height="88" rx="18" class="map-area"></rect>
                        <rect x="350" y="80" width="210" height="88" rx="18" class="map-area"></rect>
                        <rect x="650" y="85" width="220" height="92" rx="18" class="map-area"></rect>
                        <rect x="255" y="255" width="220" height="92" rx="18" class="map-area"></rect>
                      </g>
                      <path v-for="route in truckRoutes" :key="route.id" :d="route.path" :class="['route-line', route.id === selectedTruckId ? 'route-line--active' : 'route-line--inactive']"></path>
                      <g v-for="route in truckRoutes" :key="`${route.id}-stops`">
                        <g v-for="stop in route.stops" :key="`${route.id}-${stop.code}`">
                          <circle :cx="stop.x" :cy="stop.y" :class="['route-stop-shadow', route.id === selectedTruckId ? 'route-stop-shadow--active' : 'route-stop-shadow--inactive']" r="15"></circle>
                          <circle :cx="stop.x" :cy="stop.y" :class="['route-stop', route.id === selectedTruckId ? 'route-stop--active' : 'route-stop--inactive']" r="9"></circle>
                          <text v-if="route.id === selectedTruckId" :x="stop.labelX" :y="stop.labelY" class="map-label map-label--code">{{ stop.code }}</text>
                          <text v-if="route.id === selectedTruckId" :x="stop.cityLabelX" :y="stop.cityLabelY" class="map-label map-label--city">{{ stop.cityShort }}</text>
                        </g>
                      </g>
                    </svg>
                  </div>

                  <div class="tracking-map-footer">
                    <div class="tracking-summary__stats tracking-summary__stats--grid">
                      <div>
                        <span class="tracking-summary__label">Origin</span>
                        <strong>{{ selectedTruck.origin }}</strong>
                      </div>
                      <div>
                        <span class="tracking-summary__label">Destination</span>
                        <strong>{{ selectedTruck.destination }}</strong>
                      </div>
                      <div>
                        <span class="tracking-summary__label">ETA</span>
                        <strong>{{ selectedTruck.eta }}</strong>
                      </div>
                      <div>
                        <span class="tracking-summary__label">Lane Progress</span>
                        <strong>{{ selectedTruck.completion }}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  ArcElement
} from 'chart.js'
import metricsData from '../data/metrics.json'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  ArcElement
)

const theme = useTheme()
const selectedMonth = ref('All')
const isDarkMode = ref(true)
const selectedTruckId = ref('TX-204')
const isMonthMenuOpen = ref(false)
const isTruckMenuOpen = ref(false)
const latestAvailableMonthIndex = 8
const availableMetrics = metricsData.slice(0, latestAvailableMonthIndex + 1)
const currentYear = new Date(availableMetrics[availableMetrics.length - 1].date).getFullYear()

// Month options
const monthOptions = computed(() => {
  const months = metricsData.map((m, index) => ({
    title: index > latestAvailableMonthIndex ? `${m.month} (Pending)` : m.month,
    value: m.month,
    disabled: index > latestAvailableMonthIndex
  }))
  return [{ title: 'All Months', value: 'All', disabled: false }, ...months]
})

// Toggle theme
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  theme.global.name.value = isDarkMode.value ? 'dark' : 'light'
}

// Selected data based on month filter
const selectedData = computed(() => {
  if (selectedMonth.value === 'All') {
    // Calculate yearly totals/averages
    const totalShipments = availableMetrics.reduce((sum, m) => sum + m.shipment_volume, 0)
    const avgOnTimeDelivery = availableMetrics.reduce((sum, m) => sum + m.on_time_delivery_rate, 0) / availableMetrics.length
    const totalExceptions = availableMetrics.reduce((sum, m) => sum + m.open_exceptions, 0)
    
    return {
      shipment_volume: totalShipments,
      on_time_delivery_rate: avgOnTimeDelivery,
      open_exceptions: totalExceptions,
      regional_performance: calculateAverageRegionalPerformance()
    }
  } else {
    const data = metricsData.find(m => m.month === selectedMonth.value)
    return data || availableMetrics[0]
  }
})

const isLightMode = computed(() => !isDarkMode.value)
const headerLogoSrc = computed(() => (isLightMode.value ? '/fastforward_logo_lightmode_.png' : '/fastforward_logo.png'))

const comparisonCurrent = computed(() => {
  if (selectedMonth.value === 'All') {
    return availableMetrics[availableMetrics.length - 1]
  }
  const data = metricsData.find(m => m.month === selectedMonth.value)
  return data || availableMetrics[availableMetrics.length - 1]
})

// Previous month data for change calculation
const previousData = computed(() => {
  if (selectedMonth.value === 'All') {
    return availableMetrics[availableMetrics.length - 2]
  }
  const currentIndex = metricsData.findIndex(m => m.month === selectedMonth.value)
  if (currentIndex <= 0) return metricsData[0]
  return metricsData[currentIndex - 1]
})

// Change calculations
const shipmentVolumeChange = computed(() => {
  return ((comparisonCurrent.value.shipment_volume - previousData.value.shipment_volume) / previousData.value.shipment_volume) * 100
})

const onTimeDeliveryChange = computed(() => {
  return comparisonCurrent.value.on_time_delivery_rate - previousData.value.on_time_delivery_rate
})

const exceptionsChange = computed(() => {
  return comparisonCurrent.value.open_exceptions - previousData.value.open_exceptions
})

// Best region
const bestRegion = computed(() => {
  const regional = selectedData.value.regional_performance
  let best = { region: 'N/A', performance: 0 }
  for (const [region, performance] of Object.entries(regional)) {
    if (performance > best.performance) {
      best = { region, performance: performance as number }
    }
  }
  return best
})

// Regional data sorted by performance
const sortedRegionalData = computed(() => {
  const regional = selectedData.value.regional_performance
  const entries = Object.entries(regional).sort((a, b) => b[1] - a[1])
  return Object.fromEntries(entries)
})

// Helper function to calculate average regional performance
const calculateAverageRegionalPerformance = () => {
  const regions: Record<string, number[]> = {
    Northeast: [],
    Southeast: [],
    Midwest: [],
    Southwest: [],
    West: []
  }
  
  availableMetrics.forEach(month => {
    Object.entries(month.regional_performance).forEach(([region, performance]) => {
      regions[region].push(performance)
    })
  })
  
  const averages: Record<string, number> = {}
  Object.entries(regions).forEach(([region, performances]) => {
    averages[region] = performances.reduce((sum, p) => sum + p, 0) / performances.length
  })
  return averages
}

const getChartLabel = (metric: any) => metric.monthShort ?? metric.month ?? ''
const getYearAwareChartLabel = (metric: any, index: number) => index > latestAvailableMonthIndex ? `${getChartLabel(metric)}*` : getChartLabel(metric)

const selectedMonthTitle = computed(() => {
  const selected = monthOptions.value.find(item => item.value === selectedMonth.value)
  return selected?.title ?? 'All Months'
})

const truckRoutes = [
  {
    id: 'TX-204',
    name: 'Truck TX-204',
    status: 'Active',
    statusColor: '#00d9ff',
    statusIcon: 'mdi-truck-check-outline',
    origin: 'Dallas, TX',
    destination: 'Chicago, IL',
    eta: '14 hrs',
    speed: '63 mph',
    load: '28 pallets',
    lastUpdate: '2 min ago',
    checkpoint: 'St. Louis Hub',
    completion: 68,
    path: 'M180 270 C280 220, 360 180, 470 165 C560 150, 610 130, 690 115',
    stops: [
      { code: 'DAL', city: 'Dallas, TX', cityShort: 'Dallas', x: 180, y: 270, labelX: 202, labelY: 264, cityLabelX: 202, cityLabelY: 292 },
      { code: 'STL', city: 'St. Louis, MO', cityShort: 'St. Louis', x: 470, y: 165, labelX: 492, labelY: 159, cityLabelX: 492, cityLabelY: 187 },
      { code: 'CHI', city: 'Chicago, IL', cityShort: 'Chicago', x: 690, y: 115, labelX: 712, labelY: 109, cityLabelX: 712, cityLabelY: 137 }
    ]
  },
  {
    id: 'CA-118',
    name: 'Truck CA-118',
    status: 'Standby',
    statusColor: '#94a3b8',
    statusIcon: 'mdi-pause-circle-outline',
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    eta: 'Queued',
    speed: '0 mph',
    load: '16 pallets',
    lastUpdate: '12 min ago',
    checkpoint: 'Ontario Yard',
    completion: 22,
    path: 'M120 255 C170 230, 205 218, 250 225 C300 230, 330 235, 380 250',
    stops: [
      { code: 'LAX', city: 'Los Angeles, CA', cityShort: 'Los Angeles', x: 120, y: 255, labelX: 142, labelY: 249, cityLabelX: 142, cityLabelY: 277 },
      { code: 'PHX', city: 'Phoenix, AZ', cityShort: 'Phoenix', x: 380, y: 250, labelX: 402, labelY: 244, cityLabelX: 402, cityLabelY: 272 }
    ]
  },
  {
    id: 'FL-332',
    name: 'Truck FL-332',
    status: 'Delay Watch',
    statusColor: '#ff7a45',
    statusIcon: 'mdi-alert-outline',
    origin: 'Atlanta, GA',
    destination: 'Miami, FL',
    eta: '21 hrs',
    speed: '41 mph',
    load: '21 pallets',
    lastUpdate: '5 min ago',
    checkpoint: 'Jacksonville Checkpoint',
    completion: 54,
    path: 'M760 175 C810 210, 850 255, 875 310 C890 340, 915 360, 940 370',
    stops: [
      { code: 'ATL', city: 'Atlanta, GA', cityShort: 'Atlanta', x: 760, y: 175, labelX: 806, labelY: 166, cityLabelX: 812, cityLabelY: 206 },
      { code: 'MIA', city: 'Miami, FL', cityShort: 'Miami', x: 940, y: 370, labelX: 990, labelY: 382, cityLabelX: 890, cityLabelY: 352 }
    ]
  }
]

const truckOptions = truckRoutes.map(route => ({ title: route.name, value: route.id }))

const selectedTruckTitle = computed(() => selectedTruck.value.name)

const selectedTruck = computed(() => {
  return truckRoutes.find(route => route.id === selectedTruckId.value) || truckRoutes[0]
})

const selectMonth = (value: string, disabled?: boolean) => {
  if (disabled) return
  selectedMonth.value = value
  isMonthMenuOpen.value = false
}

const selectTruck = (value: string) => {
  selectedTruckId.value = value
  isTruckMenuOpen.value = false
}

const chartAxisLabelColor = computed(() => (isLightMode.value ? '#1e3a8a' : 'rgba(148, 163, 184, 0.7)'))
const chartGridColor = computed(() => (isLightMode.value ? 'rgba(37, 99, 235, 0.12)' : 'rgba(100, 116, 139, 0.1)'))
const chartTooltipBackground = computed(() => (isLightMode.value ? '#ffffff' : 'rgba(15, 20, 25, 0.92)'))
const chartTooltipTextColor = computed(() => (isLightMode.value ? '#1e3a8a' : '#ffffff'))
const chartTooltipBorderColor = computed(() => (isLightMode.value ? '#bfdbfe' : '#00d9ff'))
const positiveAccentColor = computed(() => (isLightMode.value ? '#2563eb' : '#7dd3fc'))
const toggleThumbColor = computed(() => (isLightMode.value ? '#00BFE1' : '#121821'))
const accentPalette = computed(() => (
  isLightMode.value
    ? {
        cyan: '#0369a1',
        magenta: '#be185d',
        orange: '#b45309',
        green: '#0f766e',
        indigo: '#4f46e5'
      }
    : {
        cyan: '#00d9ff',
        magenta: '#ff006e',
        orange: '#ff7a45',
        green: '#00ff88',
        indigo: '#4f46e5'
      }
))

const withAlpha = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '')
  const expanded = normalized.length === 3
    ? normalized.split('').map(character => `${character}${character}`).join('')
    : normalized
  const value = Number.parseInt(expanded, 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

const getPerformanceColor = (performance: number) => {
  if (performance >= 90) return accentPalette.value.green
  if (performance >= 85) return accentPalette.value.orange
  return accentPalette.value.magenta
}

const getPerformanceChipStyle = (performance: number) => {
  if (!isLightMode.value) return {}

  const color = getPerformanceColor(performance)
  return {
    backgroundColor: color,
    borderColor: color,
    color: '#ffffff'
  }
}

const chartAxisFont = {
  family: 'Avenir, Helvetica, Arial, sans-serif',
  size: 12,
  weight: 400
}
const selectedTruckStatusColor = computed(() => {
  if (!isLightMode.value) return selectedTruck.value.statusColor

  const lightModeColors: Record<string, string> = {
    'TX-204': accentPalette.value.cyan,
    'CA-118': '#475569',
    'FL-332': accentPalette.value.orange
  }

  return lightModeColors[selectedTruck.value.id] ?? accentPalette.value.cyan
})

const selectedTruckStatusChipStyle = computed(() => {
  if (!isLightMode.value) return {}

  return {
    backgroundColor: selectedTruckStatusColor.value,
    borderColor: selectedTruckStatusColor.value,
    color: '#ffffff'
  }
})

const selectedTruckChipStyle = computed(() => {
  const lightModeColors: Record<string, string> = {
    'TX-204': '#0369a1',
    'CA-118': '#475569',
    'FL-332': '#c2410c'
  }

  const color = isLightMode.value
    ? lightModeColors[selectedTruck.value.id] ?? '#1d4ed8'
    : selectedTruck.value.statusColor

  return {
    borderColor: color,
    color,
  }
})

// Chart configuration for bar charts
const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    filler: {
      propagate: true
    },
    tooltip: {
      backgroundColor: chartTooltipBackground.value,
      titleColor: chartTooltipTextColor.value,
      bodyColor: chartTooltipTextColor.value,
      borderColor: chartTooltipBorderColor.value,
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          return 'Volume: ' + context.parsed.y.toLocaleString()
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: chartGridColor.value,
        drawBorder: false
      },
      ticks: {
        color: chartAxisLabelColor.value,
        font: chartAxisFont
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: chartAxisLabelColor.value,
        font: chartAxisFont,
        padding: 14,
        maxRotation: 0,
        minRotation: 0
      }
    }
  }
}))

// Chart configuration for line charts
const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    filler: {
      propagate: true
    },
    tooltip: {
      backgroundColor: chartTooltipBackground.value,
      titleColor: chartTooltipTextColor.value,
      bodyColor: chartTooltipTextColor.value,
      borderColor: chartTooltipBorderColor.value,
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          if (context.dataset.label.includes('Delivery')) {
            return 'Rate: ' + context.parsed.y.toFixed(1) + '%'
          }
          return 'Exceptions: ' + context.parsed.y
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: chartGridColor.value,
        drawBorder: false
      },
      ticks: {
        color: chartAxisLabelColor.value,
        font: chartAxisFont
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: chartAxisLabelColor.value,
        font: chartAxisFont,
        padding: 14,
        maxRotation: 0,
        minRotation: 0
      }
    }
  }
}))

// Chart configuration for donut chart
const donutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: chartAxisLabelColor.value,
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          family: 'Avenir, Helvetica, Arial, sans-serif',
          size: 12,
          weight: 600
        }
      }
    },
    tooltip: {
      backgroundColor: chartTooltipBackground.value,
      titleColor: chartTooltipTextColor.value,
      bodyColor: chartTooltipTextColor.value,
      borderColor: chartTooltipBorderColor.value,
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          return context.label + ': ' + Number(context.parsed).toFixed(2) + '%'
        }
      }
    }
  }
}))

// Chart data for shipment volume (bar chart)
const shipmentVolumeChartData = computed(() => {
  const chartMetrics = selectedMonth.value === 'All' ? metricsData : [selectedData.value]
  return {
    labels: chartMetrics.map((metric, index) => selectedMonth.value === 'All' ? getYearAwareChartLabel(metric, index) : getChartLabel(metric)),
    datasets: [
      {
        label: 'Shipments',
        data: chartMetrics.map((m, index) => selectedMonth.value === 'All' && index > latestAvailableMonthIndex ? null : m.shipment_volume),
        backgroundColor: [
          withAlpha(accentPalette.value.cyan, 0.8),
          withAlpha(accentPalette.value.cyan, 0.85),
          withAlpha(accentPalette.value.cyan, 0.9),
          withAlpha(accentPalette.value.cyan, 0.88),
          withAlpha(accentPalette.value.cyan, 0.87),
          withAlpha(accentPalette.value.cyan, 0.92),
          withAlpha(accentPalette.value.cyan, 0.85),
          withAlpha(accentPalette.value.cyan, 0.89),
          withAlpha(accentPalette.value.cyan, 0.86),
          withAlpha(accentPalette.value.cyan, 0.91),
          withAlpha(accentPalette.value.cyan, 0.84),
          withAlpha(accentPalette.value.cyan, 0.88)
        ],
        borderColor: accentPalette.value.cyan,
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: accentPalette.value.cyan,
        hoverBorderWidth: 3
      }
    ]
  }
})

// Chart data for on-time delivery (line chart)
const onTimeDeliveryChartData = computed(() => {
  const chartMetrics = metricsData
  return {
    labels: chartMetrics.map((metric, index) => getYearAwareChartLabel(metric, index)),
    datasets: [
      {
        label: 'On-Time Delivery Rate (%)',
        data: chartMetrics.map((m, index) => index > latestAvailableMonthIndex ? null : m.on_time_delivery_rate),
        borderColor: accentPalette.value.magenta,
        backgroundColor: withAlpha(accentPalette.value.magenta, 0.15),
        borderWidth: 3,
        fill: true,
        tension: 0.5,
        pointBackgroundColor: accentPalette.value.magenta,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: withAlpha(accentPalette.value.magenta, 0.8),
        shadowColor: withAlpha(accentPalette.value.magenta, 0.2),
        shadowBlur: 8
      }
    ]
  }
})

// Chart data for open exceptions (area chart)
const exceptionsChartData = computed(() => {
  const chartMetrics = metricsData
  return {
    labels: chartMetrics.map((metric, index) => getYearAwareChartLabel(metric, index)),
    datasets: [
      {
        label: 'Open Exceptions',
        data: chartMetrics.map((m, index) => index > latestAvailableMonthIndex ? null : m.open_exceptions),
        borderColor: accentPalette.value.orange,
        backgroundColor: withAlpha(accentPalette.value.orange, 0.2),
        borderWidth: 3,
        fill: true,
        tension: 0.5,
        pointBackgroundColor: accentPalette.value.orange,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: withAlpha(accentPalette.value.orange, 0.8)
      }
    ]
  }
})

// Chart data for regional performance (donut chart)
const regionalPerformanceChartData = computed(() => {
  const regional = selectedData.value.regional_performance
  const labels = Object.keys(regional)
  const data = Object.values(regional)
  
  return {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: [
          withAlpha(accentPalette.value.cyan, 0.8),
          withAlpha(accentPalette.value.magenta, 0.8),
          withAlpha(accentPalette.value.orange, 0.8),
          withAlpha(accentPalette.value.green, 0.8),
          withAlpha(accentPalette.value.indigo, 0.8)
        ],
        borderColor: isLightMode.value ? 'transparent' : 'rgba(26, 31, 46, 1)',
        borderWidth: isLightMode.value ? 0 : 2,
        hoverBorderWidth: isLightMode.value ? 0 : 3,
        hoverOffset: 10
      }
    ]
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  padding-top: 0;
}

.dark-mode {
  background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
  color: #e2e8f0;
}

.light-mode {
  background: #ffffff;
  color: #1e3a8a;
}

.top-shell {
  padding: 6px 0 4px;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.4) 0%, rgba(15, 20, 25, 0.08) 100%);
}

.top-shell__logo {
  display: flex;
  justify-content: center;
  padding: 6px 12px 18px;
}

.top-shell__divider {
  height: 1px;
  margin: 5px 12px;
  background: rgba(49, 61, 89, 0.9);
}

.top-band {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 0 12px 2px;
  flex-wrap: nowrap;
}

.header-logo {
  display: block;
  width: 434px;
  max-width: 100%;
  height: auto;
}

.controls-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
  flex: 0 0 auto;
  min-height: 56px;
}

.controls-panel--left {
  flex: 1 1 auto;
  min-width: 210px;
  margin-top: 10px;
}

.controls-panel--right {
  flex: 0 0 auto;
  gap: 14px;
  margin-left: auto;
}

.month-select {
  flex: 1 1 auto;
  width: 100%;
  max-width: 210px;
}

.manual-select {
  position: relative;
  width: 100%;
  min-height: 56px;
  padding: 14px 16px 12px;
  border: 1px solid rgba(130, 169, 255, 0.42);
  border-radius: 10px;
  background: rgba(17, 24, 39, 0.36);
  color: #e2e8f0;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.manual-select__label {
  position: absolute;
  top: -30px;
  left: 0;
  padding: 0;
  font-size: 0.92rem;
  color: #cbd5e1;
  background: transparent;
}

.manual-select__content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
}

.manual-select__value {
  color: inherit;
  font-size: 1rem;
  font-weight: 600;
}

.manual-select__menu-icon {
  margin-left: auto;
}

.manual-select--open,
.manual-select:focus-visible {
  border-color: #4f67b8;
  box-shadow: 0 0 0 1px rgba(79, 103, 184, 0.2);
  outline: none;
}

.manual-select--inside-label {
  min-height: 72px;
  padding-top: 28px;
}

.manual-select--inside-label .manual-select__label {
  top: 8px;
  left: 16px;
  font-size: 0.9rem;
  line-height: 1;
}

.theme-label {
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 700;
}

.theme-switch {
  margin: 0;
}

.theme-switch :deep(.v-selection-control) {
  min-height: auto;
  align-items: center;
}

.theme-switch :deep(.v-switch__track) {
  opacity: 1;
  background: rgba(255, 255, 255, 0.42);
}

.theme-switch :deep(.v-switch__thumb) {
  background: v-bind(toggleThumbColor);
}

.stats-row {
  margin-top: 0;
  position: relative;
  z-index: 2;
}

.stat-card {
  background: rgba(26, 31, 46, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.stat-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: #121821;
  color: #ffffff !important;
}

.stat-card-icon--volume {
  background: #0891b2;
}

.stat-card-icon--delivery {
  background: #db2777;
}

.stat-card-icon--exceptions {
  background: #c2410c;
}

.stat-card-icon--region {
  background: #4f46e5;
}

.light-mode .stat-card,
.light-mode .premium-card {
  background: #ffffff !important;
  border-color: rgba(37, 99, 235, 0.2);
  color: #1e3a8a;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
}

.light-mode .theme-label {
  color: #334155;
}

.light-mode .top-shell {
  background: linear-gradient(180deg, rgba(241, 245, 249, 0.8) 0%, rgba(255, 255, 255, 0) 100%);
}

.light-mode .top-shell__divider {
  background: rgba(191, 219, 254, 0.95);
}

.light-mode .theme-switch :deep(.v-switch__track) {
  background: rgba(148, 163, 184, 0.45);
}

.light-mode .theme-switch :deep(.v-switch__thumb) {
  background: v-bind(toggleThumbColor);
}

.light-mode .stat-card:hover,
.light-mode .premium-card:hover {
  background: #ffffff !important;
  border-color: rgba(37, 99, 235, 0.26);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.light-mode .stat-label,
.light-mode .stat-change,
.light-mode .v-card-title,
.light-mode .regional-table,
.light-mode .regional-table th,
.light-mode .regional-table td {
  color: #1e3a8a;
}

.light-mode .chart-container,
.light-mode .premium-card,
.light-mode .stat-card {
  color: #1e3a8a;
}

.light-mode .stat-value {
  color: #0f172a;
}

.light-mode .chart-container :deep(canvas) {
  filter: none;
}

.light-mode :deep(.v-field),
.light-mode :deep(.v-field--variant-outlined),
.light-mode :deep(.v-field__outline),
.light-mode :deep(.v-field__overlay) {
  background: #ffffff !important;
  color: #1e3a8a !important;
}

.light-mode :deep(.v-field__input),
.light-mode :deep(.v-label),
.light-mode :deep(.v-icon),
.light-mode :deep(.v-btn__content) {
  color: #1e3a8a !important;
}

.light-mode .manual-select {
  background: #ffffff;
  border-color: rgba(79, 103, 184, 0.48);
  color: #0f172a;
}

.light-mode .manual-select__label {
  color: #334155;
  background: transparent;
}

.light-mode .manual-select .v-icon,
.light-mode .manual-select__value {
  color: #0f172a !important;
}

.light-mode :deep(.v-select__selection-text),
.light-mode :deep(.v-field input::placeholder) {
  color: #0f172a !important;
  opacity: 1 !important;
}

.light-mode :deep(.v-field__outline) {
  opacity: 0.85;
}

.light-mode :deep(.v-field__field),
.light-mode :deep(.v-field__input input),
.light-mode :deep(.v-select__selection-text),
.light-mode :deep(.v-table),
.light-mode :deep(.v-card-title) {
  color: #0f172a !important;
}

.light-mode :deep(.v-main),
.light-mode :deep(.v-container) {
  background: #ffffff !important;
}

.stat-card:hover {
  border-color: rgba(100, 116, 139, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.stat-label {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  line-height: 1;
}

.stat-value--region {
  font-size: 28px;
  line-height: 1.05;
}

.stat-change {
  font-size: 14px;
  font-weight: 600;
  color: #ff006e;
}

.stat-change.positive {
  color: v-bind(positiveAccentColor);
}

.premium-card {
  background: rgba(26, 31, 46, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 16px !important;
  height: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.premium-card :deep(.v-card-item),
.premium-card :deep(.v-card-text) {
  padding-left: 18px;
  padding-right: 18px;
}

.monthly-volume-card {
  padding-left: 0;
  padding-right: 0;
}

.monthly-volume-chart {
  padding-left: 18px;
  padding-right: 18px;
  padding-bottom: 14px;
  height: 332px;
}

.monthly-volume-card :deep(.v-card-item),
.monthly-volume-card :deep(.v-card-text) {
  padding-left: 18px;
  padding-right: 18px;
}

.trend-chart {
  padding-left: 44px;
  padding-right: 44px;
  padding-bottom: 8px;
}

.chart-card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-card-title,
.chart-card-subtitle {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.chart-card-title {
  flex: 0 0 auto !important;
  line-height: 1.2;
}

.chart-card-subtitle {
  white-space: normal;
  line-height: 1.35;
}

.tracking-card {
  overflow: hidden;
}

.tracking-card-body {
  padding-top: 10px !important;
}

.tracking-layout {
  display: grid;
  grid-template-columns: 320px 1px minmax(0, 1fr);
  gap: 0;
  border: 1px solid rgba(100, 116, 139, 0.16);
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(18, 24, 33, 0.9) 0%, rgba(15, 20, 25, 0.88) 100%);
}

.tracking-layout__divider {
  width: 1px;
  background: rgba(100, 116, 139, 0.24);
}

.tracking-sidebar {
  padding: 18px;
  background: transparent;
}

.tracking-sidebar__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.truck-select {
  min-width: 260px;
  margin-bottom: 18px;
}

.tracking-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 18px;
}

.tracking-metric-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}

.tracking-metric-card .v-icon {
  color: #9bd8ff;
}

.tracking-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tracking-summary__label--section {
  margin-bottom: 2px;
}

.tracking-timeline__item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tracking-timeline__marker {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 115, 232, 0.18);
  color: #8fc5ff;
}

.tracking-timeline__code {
  font-weight: 700;
  color: #ffffff;
}

.tracking-timeline__city {
  color: rgba(148, 163, 184, 0.78);
  font-size: 0.88rem;
}

.tracking-map-panel {
  position: relative;
  padding: 18px;
  background: transparent;
}

.tracking-map-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.tracking-map-search {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: transparent;
  color: #8fc5ff;
  font-weight: 600;
}

.tracking-status-chip,
.tracking-map-search {
  color: inherit;
}

.tracking-status-chip :deep(.v-chip__content),
.tracking-status-chip :deep(.v-icon),
.tracking-map-search :deep(.v-icon) {
  color: inherit !important;
}

.tracking-map-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  aspect-ratio: 1100 / 420;
}

.tracking-map {
  width: 100%;
  height: 100%;
  display: block;
}

.map-bg {
  fill: #111827;
}

.map-grid,
.map-areas,
.map-water {
  pointer-events: none;
}

.map-road {
  fill: none;
  stroke: rgba(51, 65, 85, 0.9);
  stroke-width: 12;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.map-road--major {
  stroke: rgba(71, 85, 105, 0.98);
  stroke-width: 16;
}

.map-water path {
  fill: rgba(30, 58, 138, 0.28);
}

.map-area {
  fill: rgba(30, 41, 59, 0.76);
  stroke: rgba(96, 165, 250, 0.28);
  stroke-width: 1.5;
}

.route-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.route-line--active {
  stroke: url(#routeGlow);
  stroke-width: 8;
  filter: drop-shadow(0 0 10px rgba(26, 115, 232, 0.28));
}

.route-line--inactive {
  stroke: rgba(71, 85, 105, 0.65);
  stroke-width: 5;
}

.route-stop-shadow {
  fill: transparent;
}

.route-stop-shadow--active {
  fill: rgba(26, 115, 232, 0.18);
}

.route-stop-shadow--inactive {
  fill: rgba(148, 163, 184, 0.18);
}

.route-stop {
  stroke-width: 4;
}

.route-stop--active {
  fill: #1a73e8;
  stroke: rgba(255, 255, 255, 0.95);
}

.route-stop--inactive {
  fill: rgba(71, 85, 105, 0.95);
  stroke: rgba(255, 255, 255, 0.95);
}

.map-label {
  fill: #e2e8f0;
  font-size: 15px;
  font-weight: 700;
}

.map-label--code {
  fill: #93c5fd;
}

.map-label--city {
  fill: rgba(226, 232, 240, 0.88);
  font-size: 16px;
  font-weight: 600;
}

.tracking-summary__label {
  display: block;
  color: rgba(148, 163, 184, 0.75);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.tracking-summary__title {
  font-size: 1.15rem;
  font-weight: 700;
}

.tracking-summary__stats {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}

.tracking-summary__stats--grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

.tracking-summary__stats--grid > div {
  position: relative;
  padding: 0 18px;
}

.tracking-summary__stats--grid > div:not(:first-child)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: rgba(100, 116, 139, 0.28);
}

.tracking-map-footer {
  display: flex;
  align-items: stretch;
  margin-top: 14px;
  padding: 10px 0 0;
}

.tracking-map-footer .tracking-summary__label {
  color: rgba(148, 163, 184, 0.78);
}

.tracking-map-footer strong {
  color: #e2e8f0;
}

@media (max-width: 1200px) {
  .stat-card {
    padding: 22px 20px;
  }

  .premium-card :deep(.v-card-item),
  .premium-card :deep(.v-card-text) {
    padding-left: 16px;
    padding-right: 16px;
  }

  .monthly-volume-chart {
    height: 290px;
  }

  .chart-container--donut {
    height: 300px;
  }

  .trend-chart {
    height: 236px;
    padding-left: 32px;
    padding-right: 32px;
  }

  .tracking-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .tracking-layout__divider {
    width: auto;
    height: 1px;
  }

  .tracking-summary__stats--grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 900px) {
  .top-band {
    align-items: flex-end;
    gap: 12px;
    padding: 0 8px 2px;
  }

  .controls-panel--left,
  .controls-panel--right {
    min-width: 0;
  }

  .controls-panel--left {
    margin-top: 8px;
  }

  .controls-panel--right {
    margin-left: 0;
  }

  .top-shell__logo {
    justify-content: center;
  }

  .header-logo {
    width: 304px;
  }

  .month-select {
    max-width: 190px;
  }

  .stats-row {
    margin-bottom: 20px !important;
  }

  .stat-card {
    padding: 20px 16px;
  }

  .premium-card :deep(.v-card-item),
  .premium-card :deep(.v-card-text),
  .monthly-volume-card :deep(.v-card-item),
  .monthly-volume-card :deep(.v-card-text) {
    padding-left: 14px;
    padding-right: 14px;
  }

  .chart-container {
    height: 232px;
  }

  .monthly-volume-chart {
    height: 220px;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 12px;
  }

  .chart-container--donut {
    height: 230px;
  }

  .trend-chart {
    height: 198px;
    padding-bottom: 8px;
  }

  .tracking-metrics {
    grid-template-columns: 1fr;
  }

  .tracking-map-toolbar,
  .tracking-sidebar__header {
    flex-direction: column;
    align-items: stretch;
  }

  .tracking-map-footer {
    margin-top: 12px;
  }

  .tracking-summary__stats--grid {
    grid-template-columns: 1fr 1fr;
  }

  .tracking-summary__stats--grid > div:nth-child(odd)::before {
    display: none;
  }
}

@media (max-width: 640px) {
  .top-band {
    gap: 10px;
  }

  .controls-panel {
    gap: 10px;
  }

  .theme-label {
    font-size: 0.82rem;
  }

  .month-select {
    max-width: 170px;
  }

  .header-logo {
    width: 250px;
  }

  .stat-card {
    padding: 18px 14px;
    border-radius: 14px;
  }

  .chart-card-title {
    font-size: 1.15rem !important;
  }

  .chart-card-subtitle {
    font-size: 0.92rem !important;
  }

  .chart-container,
  .monthly-volume-chart,
  .chart-container--donut {
    height: 188px;
  }

  .trend-chart {
    height: 166px;
    padding-left: 18px;
    padding-right: 18px;
    padding-bottom: 6px;
  }

  .tracking-summary__stats--grid {
    grid-template-columns: 1fr;
  }

  .tracking-summary__stats--grid > div {
    padding: 12px 0;
  }

  .tracking-summary__stats--grid > div:not(:first-child)::before {
    left: 0;
    right: 0;
    top: 0;
    bottom: auto;
    width: auto;
    height: 1px;
  }
}

.premium-card:hover {
  background: rgba(26, 31, 46, 1) !important;
  border-color: rgba(100, 116, 139, 0.4);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.chart-container {
  position: relative;
  height: 300px;
  padding: 4px 0 10px;
}

.chart-container :deep(canvas) {
  max-width: 100%;
  width: 100% !important;
  height: 100% !important;
}

.chart-container--donut {
  height: 332px;
}

.regional-table {
  background: transparent !important;
}

.regional-table th,
.regional-table td {
  padding-left: 0 !important;
}

.regional-table tbody tr {
  border-color: rgba(100, 116, 139, 0.1) !important;
  transition: background-color 0.2s ease;
}

.regional-table tbody tr:hover {
  background-color: rgba(100, 116, 139, 0.05) !important;
}

.light-mode .tracking-layout {
  background: linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%);
  border-color: rgba(37, 99, 235, 0.16);
}

.light-mode .tracking-layout__divider {
  background: rgba(148, 163, 184, 0.28);
}

.light-mode .tracking-map-wrap {
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
}

.light-mode .map-bg {
  fill: #ffffff;
}

.light-mode .map-road {
  stroke: rgba(203, 213, 225, 0.95);
}

.light-mode .map-road--major {
  stroke: rgba(186, 230, 253, 0.95);
}

.light-mode .map-water path {
  fill: rgba(191, 219, 254, 0.7);
}

.light-mode .map-area {
  fill: rgba(219, 234, 254, 0.7);
  stroke: rgba(96, 165, 250, 0.45);
}

.light-mode .route-line--inactive {
  stroke: rgba(148, 163, 184, 0.7);
}

.light-mode .route-stop--active,
.light-mode .route-stop--inactive {
  stroke: rgba(255, 255, 255, 0.95);
}

.light-mode .map-label {
  fill: #1e3a8a;
}

.light-mode .map-label--city {
  fill: #475569;
}

.light-mode .tracking-summary__label {
  color: #64748b;
}

.light-mode .stat-card-icon {
  color: #ffffff !important;
}

.light-mode .tracking-sidebar {
  background: transparent;
}

.light-mode .tracking-metric-card {
  background: rgba(37, 99, 235, 0.06);
}

.light-mode .tracking-metric-card .v-icon,
.light-mode .tracking-timeline__marker {
  color: #1d4ed8;
}

.light-mode .tracking-timeline__marker {
  background: rgba(37, 99, 235, 0.1);
}

.light-mode .tracking-timeline__code {
  color: #0f172a;
}

.light-mode .tracking-timeline__city,
.light-mode .tracking-map-search,
.light-mode .tracking-map-footer {
  color: #334155;
}

.light-mode .tracking-map-search {
  background: transparent;
}

.light-mode .tracking-map-footer .tracking-summary__label {
  color: #64748b;
}

.light-mode .tracking-map-footer strong {
  color: #0f172a;
}

</style>
