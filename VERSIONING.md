# Versiyon Yönetimi / Version Management

## Format
`MAJOR.YEAR.MONTH.RELEASE`

Örnek: `1.26.1.1`
- **1** = Major sürüm
- **26** = Yıl (2026)
- **1** = Ay (Ocak)
- **1** = Bu aydaki release sayısı

## Dosyalar

### Frontend
- `client/src/version.json` - Version bilgilerini içerir

### Backend  
- `ReportingApp.API/ReportingApp.API.csproj` - Version, AssemblyVersion, FileVersion tags

## Versiyon Güncelleme

### Yeni Release (aynı ay içinde)
Release sayısını artır: `1.26.1.1` → `1.26.1.2`

### Yeni Ay
Ay değişince release sıfırlanır: `1.26.1.5` → `1.26.2.1`

### Yeni Yıl
Yıl değişince ay ve release sıfırlanır: `1.26.12.3` → `1.27.1.1`

### Major Sürüm
Büyük değişikliklerde major artırılır: `1.26.1.1` → `2.26.1.1`

## Mevcut Versiyon
**v1.26.1.1** (16 Ocak 2026)
