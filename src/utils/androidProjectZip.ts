import JSZip from 'jszip';

export interface AndroidFile {
  path: string;
  content: string;
  description: string;
}

export const getAndroidProjectFiles = (): AndroidFile[] => {
  return [
    {
      path: 'build.gradle.kts',
      description: 'Project-level Gradle build configuration',
      content: `// Top-level build file for DuckFarm Pro Android Project
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.ksp) apply false
}
`
    },
    {
      path: 'settings.gradle.kts',
      description: 'Gradle project settings',
      content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "DuckFarmPro"
include(":app")
`
    },
    {
      path: 'app/build.gradle.kts',
      description: 'App-level Gradle with Room SQLite & Jetpack Compose',
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.duckfarm.pro"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.duckfarm.pro"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // AndroidX & Compose
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation(platform("androidx.compose:compose-bom:2024.10.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3:1.3.0")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.3")

    // SQLite Room Persistence (Fully Offline)
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
`
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      description: 'Android App Manifest',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:name=".DuckFarmApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="DuckFarm Pro"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.DuckFarmPro">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.DuckFarmPro">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
    },
    {
      path: 'app/src/main/java/com/duckfarm/pro/data/local/DuckFarmDatabase.kt',
      description: 'SQLite Room Database Implementation in Kotlin',
      content: `package com.duckfarm.pro.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.duckfarm.pro.data.local.dao.*
import com.duckfarm.pro.data.local.entity.*

/**
 * DuckFarm Pro Offline SQLite Database
 * Powers full local persistence for smartphones and tablets.
 */
@Database(
    entities = [
        CoopEntity::class,
        EggProductionEntity::class,
        FeedItemEntity::class,
        FeedUsageEntity::class,
        EggSaleEntity::class,
        FinanceEntity::class,
        HealthScheduleEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class DuckFarmDatabase : RoomDatabase() {
    abstract fun coopDao(): CoopDao
    abstract fun eggProductionDao(): EggProductionDao
    abstract fun feedDao(): FeedDao
    abstract fun eggSaleDao(): EggSaleDao
    abstract fun financeDao(): FinanceDao
    abstract fun healthDao(): HealthDao

    companion object {
        @Volatile
        private var INSTANCE: DuckFarmDatabase? = null

        fun getDatabase(context: Context): DuckFarmDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    DuckFarmDatabase::class.java,
                    "duckfarm_offline.db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`
    },
    {
      path: 'app/src/main/java/com/duckfarm/pro/data/local/entity/Entities.kt',
      description: 'Kotlin Room SQLite Data Entities',
      content: `package com.duckfarm.pro.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "coops")
data class CoopEntity(
    @PrimaryKey val id: String,
    val code: String,
    val name: String,
    val breed: String,
    val capacity: Int,
    val currentDucks: Int,
    val maleDucks: Int,
    val femaleDucks: Int,
    val ageWeeks: Int,
    val status: String,
    val notes: String? = null
)

@Entity(tableName = "egg_production")
data class EggProductionEntity(
    @PrimaryKey val id: String,
    val coopId: String,
    val date: String,
    val morningEggs: Int,
    val afternoonEggs: Int,
    val totalEggs: Int,
    val goodEggs: Int,
    val crackedEggs: Int,
    val smallEggs: Int,
    val layingRatePercent: Double,
    val notes: String? = null
)

@Entity(tableName = "feed_items")
data class FeedItemEntity(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val unit: String,
    val currentStock: Double,
    val minThreshold: Double,
    val costPerUnit: Double,
    val supplier: String? = null
)

@Entity(tableName = "feed_usage")
data class FeedUsageEntity(
    @PrimaryKey val id: String,
    val coopId: String,
    val feedItemId: String,
    val date: String,
    val quantityUsed: Double,
    val timeOfDay: String
)

@Entity(tableName = "egg_sales")
data class EggSaleEntity(
    @PrimaryKey val id: String,
    val invoiceNumber: String,
    val customerName: String,
    val customerPhone: String? = null,
    val date: String,
    val quantity: Double,
    val unit: String,
    val pricePerUnit: Double,
    val totalAmount: Double,
    val paymentStatus: String,
    val paidAmount: Double
)

@Entity(tableName = "financial_transactions")
data class FinanceEntity(
    @PrimaryKey val id: String,
    val date: String,
    val type: String, // "income" or "expense"
    val category: String,
    val amount: Double,
    val description: String,
    val referenceId: String? = null
)

@Entity(tableName = "health_schedules")
data class HealthScheduleEntity(
    @PrimaryKey val id: String,
    val title: String,
    val type: String,
    val coopId: String,
    val scheduledDate: String,
    val dosage: String,
    val status: String, // scheduled, completed, overdue
    val notes: String? = null
)
`
    },
    {
      path: 'app/src/main/java/com/duckfarm/pro/data/local/dao/DuckFarmDaos.kt',
      description: 'Kotlin Room Data Access Objects (DAOs)',
      content: `package com.duckfarm.pro.data.local.dao

import androidx.room.*
import com.duckfarm.pro.data.local.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface CoopDao {
    @Query("SELECT * FROM coops ORDER BY code ASC")
    fun getAllCoops(): Flow<List<CoopEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCoop(coop: CoopEntity)

    @Delete
    suspend fun deleteCoop(coop: CoopEntity)
}

@Dao
interface EggProductionDao {
    @Query("SELECT * FROM egg_production ORDER BY date DESC")
    fun getAllProduction(): Flow<List<EggProductionEntity>>

    @Query("SELECT * FROM egg_production WHERE date = :date")
    suspend fun getProductionByDate(date: String): List<EggProductionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecord(record: EggProductionEntity)
}

@Dao
interface FeedDao {
    @Query("SELECT * FROM feed_items ORDER BY name ASC")
    fun getAllFeedItems(): Flow<List<FeedItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFeedItem(feedItem: FeedItemEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUsage(usage: FeedUsageEntity)
}

@Dao
interface EggSaleDao {
    @Query("SELECT * FROM egg_sales ORDER BY date DESC")
    fun getAllSales(): Flow<List<EggSaleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSale(sale: EggSaleEntity)
}

@Dao
interface FinanceDao {
    @Query("SELECT * FROM financial_transactions ORDER BY date DESC")
    fun getAllTransactions(): Flow<List<FinanceEntity>>

    @Query("SELECT SUM(amount) FROM financial_transactions WHERE type = 'income'")
    fun getTotalIncome(): Flow<Double?>

    @Query("SELECT SUM(amount) FROM financial_transactions WHERE type = 'expense'")
    fun getTotalExpense(): Flow<Double?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(tx: FinanceEntity)
}

@Dao
interface HealthDao {
    @Query("SELECT * FROM health_schedules ORDER BY scheduledDate ASC")
    fun getAllSchedules(): Flow<List<HealthScheduleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSchedule(schedule: HealthScheduleEntity)
}
`
    },
    {
      path: 'app/src/main/java/com/duckfarm/pro/MainActivity.kt',
      description: 'Android Jetpack Compose Main Activity',
      content: `package com.duckfarm.pro

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.duckfarm.pro.ui.DuckFarmApp
import com.duckfarm.pro.ui.theme.DuckFarmProTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DuckFarmProTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DuckFarmApp()
                }
            }
        }
    }
}
`
    },
    {
      path: 'app/src/main/java/com/duckfarm/pro/DuckFarmApplication.kt',
      description: 'Android Application class initializing SQLite database',
      content: `package com.duckfarm.pro

import android.app.Application
import com.duckfarm.pro.data.local.DuckFarmDatabase

class DuckFarmApplication : Application() {
    val database: DuckFarmDatabase by lazy {
        DuckFarmDatabase.getDatabase(this)
    }

    override fun onCreate() {
        super.onCreate()
        // Database is ready for fully offline operations
    }
}
`
    },
    {
      path: 'README_BUILD_APK.md',
      description: 'Comprehensive Guide to Build the Release APK',
      content: `# DuckFarm Pro - Android APK Compilation Guide

This project is configured as a fully offline Android application using Kotlin, Jetpack Compose, Material 3, and SQLite Room database.

## Method 1: Build APK via Android Studio (Standard)
1. Download this zipped project and extract it.
2. Open **Android Studio** (Hedgehog, Iguana, or Koala).
3. Click **Open** and select the extracted folder.
4. Let Gradle sync dependencies.
5. In the top menu, navigate to:
   \`Build\` > \`Build Bundle(s) / APK(s)\` > \`Build APK(s)\`.
6. Once compilation finishes, click **locate** to grab your installable \`app-debug.apk\` or configure signing for release.

## Method 2: Command Line (CLI)
\`\`\`bash
# Build Debug APK
./gradlew assembleDebug

# Output APK path:
# app/build/outputs/apk/debug/app-debug.apk

# Build Release APK
./gradlew assembleRelease
\`\`\`

## Method 3: Instant Android PWA Installation (Zero-Build)
- Open the live DuckFarm Pro web application in Google Chrome on your Android smartphone or tablet.
- Tap the **"Install App"** button at the top or Chrome menu (3 dots) > **"Add to Home screen" / "Install App"**.
- An APK wrapper will be automatically synthesized by Android WebAPK service, installing it directly to your launcher!
`
    }
  ];
};

export const downloadAndroidProjectZip = async () => {
  const zip = new JSZip();
  const files = getAndroidProjectFiles();

  files.forEach(file => {
    zip.file(file.path, file.content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'DuckFarmPro_Android_Kotlin_SQLite_Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
