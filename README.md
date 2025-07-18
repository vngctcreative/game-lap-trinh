# GDT-TomiSakae

# Phân tích Source Code Game Dev Tycoon (Phiên bản NW.js)

Tài liệu này mô tả cấu trúc và các thành phần của mã nguồn Game Dev Tycoon, dựa trên việc phân tích file `defaultBrowser.html` và nội dung của file `codeNw.js` (đã được tách thành các module nhỏ hơn trong thư mục `compressed/`).

## Mô tả các file chính

### 1. `defaultBrowser.html`

- **Mô tả**: Là file HTML trung tâm, chịu trách nhiệm khởi chạy toàn bộ ứng dụng Game Dev Tycoon. Nó thiết lập cấu trúc DOM cơ bản, tải các thư viện CSS, JavaScript cần thiết và các module của game theo một thứ tự nhất định để đảm bảo các phụ thuộc được giải quyết.
- **Các thành phần chính**:
  - Khai báo DOCTYPE HTML5.
  - Tải các file CSS (jQuery UI, FontAwesome, SimpleModal, RoyalSlider, và các file CSS tùy chỉnh của game).
  - Tải một loạt các thư viện JavaScript của bên thứ ba (jQuery, EaselJS, GreenSock, RequireJS, v.v.).
  - Tải các module JavaScript của game từ thư mục `compressed/` (đã được tách từ `codeNw.js` gốc). Thứ tự tải các file này rất quan trọng.
  - Chứa các `div` đóng vai trò là "template" hoặc "container" cho các thành phần giao diện người dùng (UI) của game như dialogs, panels, splash screen, thanh trạng thái, v.v.
  - Sử dụng placeholder `ll:{Key}` cho việc đa ngôn ngữ.
- **Quan hệ**:
  - Là điểm bắt đầu của ứng dụng.
  - Gọi và khởi tạo các module JavaScript chính như `GameManager`, `UI`, `VisualsManager`.
  - Cung cấp cấu trúc DOM để các module JavaScript có thể thao tác và hiển thị nội dung.

### 2. Thư mục `compressed/` (Các module JavaScript đã tách)

Thư mục này chứa các file JavaScript được tách ra từ `codeNw.js` gốc, mỗi file đại diện cho một module hoặc một nhóm chức năng cụ thể.

#### 2.1. `core/`

- **`GameFlags.js`**

  - **Mô tả**: Định nghĩa một đối tượng `GameFlags` chứa các cờ (flags) và hằng số cấu hình cho game. Các giá trị này ảnh hưởng đến nhiều khía cạnh của gameplay như thời gian phát triển game, các yếu tố điểm, bật/tắt các tính năng gỡ lỗi.
  - **Các thành phần chính**: Đối tượng `GameFlags` với các thuộc tính boolean và số.
  - **Quan hệ**: Được sử dụng rộng rãi bởi hầu hết các module khác để kiểm tra trạng thái hoặc lấy giá trị cấu hình.

- **`CoreExtensions.js`**

  - **Mô tả**: Mở rộng các đối tượng JavaScript gốc (`String`, `Number`, `Array`, `jQuery.fn`) bằng cách thêm các phương thức tiện ích mới.
  - **Các thành phần chính**: Các phương thức như `String.prototype.format`, `String.prototype.localize`, `Array.prototype.pickRandom`, `Number.prototype.clamp`.
  - **Quan hệ**: Các phương thức này được sử dụng trong toàn bộ mã nguồn để thao tác dữ liệu và chuỗi một cách thuận tiện hơn.

- **`Logger.js`**

  - **Mô tả**: Cung cấp một hệ thống ghi log (nhật ký) tập trung cho việc gỡ lỗi, ghi nhận lỗi và thông tin trong quá trình game chạy. Có khả năng lưu log lỗi vào `DataStore`.
  - **Các thành phần chính**: `Logger.LogError`, `Logger.LogWarning`, `Logger.LogInfo`, `Logger.LogModError`.
  - **Quan hệ**: Được gọi bởi nhiều module khác khi cần ghi nhận sự kiện hoặc lỗi. Tương tác với `DataStore` để lưu trữ log.

- **`PlatformShim.js`**
  - **Mô tả**: Tạo một lớp trừu tượng (abstraction layer) để xử lý các chức năng đặc thù của từng nền tảng mà game có thể chạy trên đó (ví dụ: Windows 8 Store App, NW.js). Điều này giúp phần còn lại của code không cần quan tâm đến chi tiết triển khai của nền tảng.
  - **Các thành phần chính**: Các hàm như `PlatformShim.alert`, `PlatformShim.getUserName`, `PlatformShim.goToReviewPage`, `PlatformShim.getVersion`. Các biến như `PlatformShim.ISWIN8`, `PlatformShim.ISLOWRES`.
  - **Quan hệ**: Được sử dụng bởi các module cần tương tác với hệ thống (ví dụ: `UI`, `GameManager`, `DataStore`).

#### 2.2. `reporting/`

- **`ErrorReporting.js`**
  - **Mô tả**: Module đơn giản, có vẻ như được thiết kế để gửi báo cáo lỗi đến một dịch vụ bên ngoài (hiện tại hàm `report` đang trống).
  - **Các thành phần chính**: `ErrorReporting.report`.
  - **Quan hệ**: Được gọi bởi `PlatformShim` khi có lỗi không mong muốn xảy ra trên Windows 8.

#### 2.3. `localization/`

- **`Localization.js`**
  - **Mô tả**: Chịu trách nhiệm xử lý đa ngôn ngữ cho game. Nó chứa một từ điển các chuỗi dịch và cung cấp hàm để lấy chuỗi đã dịch dựa trên key.
  - **Các thành phần chính**: `Localization.localize`, `Localization.processHtml`, `Localization.setLanguage`, `String.prototype.localize`.
  - **Quan hệ**: Được sử dụng bởi `LanguageMgr` để thiết lập ngôn ngữ và bởi hầu hết các module UI để hiển thị văn bản đã được dịch.

#### 2.4. `game/`

##### 2.4.1. `GameManagerStates.js`

- **Mô tả**: Định nghĩa đối tượng `State` chứa các hằng số chuỗi đại diện cho các trạng thái khác nhau của trò chơi (ví dụ: `Idle`, `CreateGame`).
- **Các thành phần chính**: Đối tượng `State`.
- **Quan hệ**: Được sử dụng chủ yếu bởi `GameManager` để theo dõi và chuyển đổi trạng thái game.

##### 2.4.2. `GameManager.js`

- **Mô tả**: Là module trung tâm điều khiển luồng chính của game. Quản lý trạng thái game, vòng lặp cập nhật game, xử lý việc bắt đầu game mới, lưu/tải game, quản lý công ty người chơi, các dự án đang phát triển (game, engine, hợp đồng).
- **Các thành phần chính**:
  - Vòng lặp game (`GameManager.update`, `GameManager.startDrawLoop`).
  - Quản lý thời gian game (`GameManager.gameTime`, `GameManager.SECONDS_PER_WEEK`).
  - Xử lý trạng thái game (`GameManager.state`, `GameManager.transitionToState`).
  - Lưu và tải game (`GameManager.save`, `GameManager.load`, `GameManager.reload`).
  - Các hàm quản lý dự án: `createNewGame`, `createEngine`, `startContract`, `startProject`.
  - Các hàm quản lý nhân viên và công ty.
  - Tương tác với nhiều module khác như `UI`, `VisualsManager`, `Sound`, `DataStore`, `Company`, `Game`, `Research`, `Missions`.
- **Quan hệ**: Là module cốt lõi, tương tác với hầu hết các module khác của game.

##### 2.4.3. `classes/`

- **`Booth.js`**: Định nghĩa lớp `Booth` (gian hàng tại hội chợ).
- **`Company.js`**: Định nghĩa lớp `Company`, chứa thông tin về công ty của người chơi (tên, tiền, fan, game đã phát hành, nhân viên, v.v.).
- **`Game.js`**: Định nghĩa lớp `Game`, chứa thông tin về một tựa game đang phát triển hoặc đã phát hành.
- **`GameState.js`**: Định nghĩa các trạng thái của một tựa game (ví dụ: `notStarted`, `development`).
- **`GameGenre.js`**: Định nghĩa các thể loại game (`Action`, `RPG`, `Simulation`, v.v.) và các hệ số liên quan.
- **`Genre.js`**: Lớp cơ bản cho `GameGenre` (có vẻ không được dùng nhiều bằng `GameGenre`).
- **Quan hệ**: Các lớp này được `GameManager` và các module logic khác sử dụng để tạo và quản lý các thực thể trong game.

##### 2.4.4. `logic/`

- **`GameTrends.js`**: Xử lý logic về các xu hướng thị trường game (thể loại, chủ đề phổ biến).
- **`Notification.js`**: Định nghĩa lớp `Notification` và các loại thông báo (`NotificationType`).
- **`SaveGameData.js`**: Định nghĩa cấu trúc dữ liệu cho thông tin tóm tắt của một file save.
- **`Character.js`**: Định nghĩa lớp `Character` (nhân vật/nhân viên), các trạng thái (`CharacterState`) và hướng (`CharacterOrientation`) của nhân vật.
- **`General.js`**: Chứa các hàm tiện ích chung cho logic game, ví dụ: xử lý sự kiện hàng tuần, tính toán chi phí, phát hành game.
- **Quan hệ**: Các module này cung cấp logic và cấu trúc dữ liệu nền tảng cho gameplay. `GameManager` và các module game khác (Sales, Reviews, Missions) sử dụng chúng.

##### 2.4.5. `content/`

- **`Media.js`**: Chứa dữ liệu và logic để tạo ra các thông báo, tin tức dựa trên sự kiện trong game (ví dụ: phát hành game mới, sự kiện ngành).
- **`Missions.js`**: Định nghĩa các nhiệm vụ (missions) trong quá trình phát triển game, các giai đoạn phát triển, và các yếu tố liên quan.
- **`Platforms.js`**: Chứa dữ liệu về các nền tảng game (PC, G64, TES, v.v.), ngày phát hành, ngày ngừng hỗ trợ, thị phần.
- **`Topics.js`**: Định nghĩa các chủ đề game (Sports, Military, Fantasy, v.v.) và sự phù hợp của chúng với các thể loại, đối tượng người chơi.
- **Quan hệ**: Cung cấp dữ liệu "nội dung" cho game. Được sử dụng bởi `GameManager`, `Reviews`, `Sales` để mô phỏng thế giới game.

##### 2.4.6. `mechanics/`

- **`Reviews.js`**: Xử lý logic tạo đánh giá (review) cho game sau khi phát hành, dựa trên các yếu tố như điểm thiết kế, công nghệ, lỗi.
- **`Sales.js`**: Xử lý logic bán game, tính toán doanh thu, số lượng bản bán được.
- **`SalesEvents.js`**: Quản lý các sự kiện đặc biệt liên quan đến doanh số bán game.
- **`DecisionNotifications.js`**: Tạo và quản lý các thông báo yêu cầu người chơi đưa ra quyết định.
- **`ProjectContracts.js`**: Quản lý logic cho các hợp đồng gia công hoặc phát hành game.
- **Quan hệ**: Các module này triển khai các cơ chế gameplay cốt lõi. Chúng tương tác chặt chẽ với `GameManager`, `Company`, `Game`, và các module `content`.

##### 2.4.7. `utils/`

- **`LevelCalculator.js`**: Tính toán điểm kinh nghiệm, cấp độ cho nhân vật và các tính năng game.
- **`SavegameMigrator.js`**: Xử lý việc nâng cấp file save từ các phiên bản game cũ hơn lên phiên bản hiện tại.
- **`SavegameConverter.js`**: Chuyển đổi định dạng file save (có thể là giữa phiên bản PC và mobile).
- **Quan hệ**: Cung cấp các hàm tiện ích hỗ trợ cho các module khác, đặc biệt là `GameManager` và `DataStore`.

#### 2.5. `platform/`

- **`SteamAPI.js`**: Đóng gói các tương tác với Steamworks API thông qua thư viện Greenworks (nếu có).
- **`SteamGreenworks.js`**: Cung cấp các hàm cụ thể để tương tác với Steam Workshop (upload, download, quản lý mod) thông qua Greenworks.
- **Quan hệ**: `SteamAPI` được `DataStore` sử dụng để lưu game lên Steam Cloud. `SteamGreenworks` được `UI` sử dụng cho panel quản lý mod. `GameManager` có thể dùng để kích hoạt Achievements.

#### 2.6. `system/`

- **`DataStore.js`**: Quản lý việc lưu và tải dữ liệu game. Hỗ trợ nhiều phương thức lưu trữ như localStorage, Windows Roaming Settings, và Steam Cloud (thông qua `SteamAPI`).
- **`LanguageManager.js`**: Quản lý việc chọn và áp dụng ngôn ngữ cho game, có thể dựa trên cài đặt hệ thống hoặc Steam.
- **`ResourceKeys.js`**: Định nghĩa một đối tượng `ResourceKeys` chứa các key và đường dẫn tới các file tài nguyên đồ họa của game.
- **`StartupAndSplash.js`**: Xử lý quá trình khởi động game, hiển thị màn hình chờ (splash screen), kiểm tra EULA, và bắt đầu game mới hoặc tiếp tục game đã lưu.
- **`SoundManager.js`**: Quản lý việc tải và phát các hiệu ứng âm thanh, nhạc nền sử dụng SoundJS.
- **`UpdateNotifications.js`**: Kiểm tra và hiển thị các thông báo liên quan đến cập nhật game hoặc phiên bản đầy đủ (nếu đang chơi bản lite/trial).
- **`SupportPacks.js`**: Xử lý các gói hỗ trợ (có thể là IAP trên Windows Store).
- **`ghg4.js`**: Module phân tích (analytics), có thể là Localytics, để thu thập dữ liệu sử dụng game.
- **`UpdateChecker.js`**: Kiểm tra phiên bản cập nhật mới của game (cho các bản không phải Steam).
- **Quan hệ**: Các module này là nền tảng của hệ thống game. `DataStore` được `GameManager` dùng để lưu/tải. `LanguageManager` dùng `Localization`. `ResourceKeys` được `VisualsManager` và `GameResourceManager` sử dụng. `StartupAndSplash` khởi tạo `GameManager`.

#### 2.7. `ui/`

##### 2.7.1. `CustomAlert.js`

- **Mô tả**: Tạo ra các hộp thoại thông báo (alert) tùy chỉnh với nhiều kiểu khác nhau (info, warning, error, success).
- **Các thành phần chính**: `CustomAlert.show`, `CustomAlert.info`, `CustomAlert.error`.
- **Quan hệ**: Được sử dụng bởi `Logger` và các module khác khi cần hiển thị thông báo đặc biệt cho người dùng.

##### 2.7.2. `UIManager.js` (và các IIFE mở rộng)

- **Mô tả**: Quản lý giao diện người dùng (UI) chính của game. Bao gồm việc hiển thị/ẩn các dialog, panel, xử lý sự kiện click, cập nhật thanh trạng thái, menu chính, menu ngữ cảnh, và các thành phần UI khác. Các IIFE xung quanh các hàm như `UI.toggleMainMenu` hay `UI.resetStatusBar` thực chất là các phần mở rộng hoặc module con của `UI`.
- **Các thành phần chính**:
  - `UI.showModalContent`, `UI.closeModal`, `UI.showNotifications`.
  - Các hàm hiển thị dialog cụ thể: `UI.showGameDefinition`, `UI.showFeatureList`, `UI.showReviewWindow`, `UI.showNewGameView`, `UI.showLoadView`, `UI.showSaveView`, v.v.
  - Quản lý menu: `UI.toggleMainMenu`, `UI.showContextMenu`.
  - Cập nhật thanh trạng thái: `UI.updateStatusBar`.
- **Quan hệ**: Tương tác chặt chẽ với `GameManager` để hiển thị thông tin và nhận input từ người chơi. Sử dụng `Sound` để phát âm thanh khi tương tác UI.

##### 2.7.3. `elements/`

- **`SettingsGameplay.js`**: Quản lý các cài đặt gameplay mà người chơi có thể thay đổi (ví dụ: chế độ tutorial, chế độ animation).
- **`FlippingCounter.js`**: Module tạo hiệu ứng số đếm lật (kiểu bảng điện tử cũ) cho hiển thị điểm hoặc tiền.
- **`Knowledge.js`**: Quản lý "kiến thức" mà người chơi thu thập được qua các lần chơi (ví dụ: sự kết hợp tốt/xấu giữa chủ đề và thể loại).
- **Quan hệ**: Được `UI` sử dụng để hiển thị các tùy chọn cài đặt và các yếu tố giao diện đặc biệt. `Knowledge` tương tác với `GameManager` và `DataStore`.

#### 2.8. `visuals/`

- **`CanvasManager.js`**: Khởi tạo và quản lý các đối tượng canvas HTML5 dùng để vẽ đồ họa cho game. Bao gồm canvas nền, canvas nhân vật, canvas lớp phủ.
- **`GameResourceManager.js`**: Quản lý việc tải và truy cập các tài nguyên đồ họa (hình ảnh) cho game, sử dụng `html5Preloader`.
- **`animations/`**:
  - **`SpriteSheetX.js`**: Lớp mở rộng từ `createjs.SpriteSheet` của EaselJS, có thể thêm các thuộc tính tùy chỉnh.
  - **`AnimationSpriteSheets.js`**: Định nghĩa dữ liệu cho các sprite sheet (khung hình, animation) được sử dụng trong game.
  - **`BitmapAnimationFactory.js`**: Nhà máy (factory) để tạo các đối tượng `BitmapAnimationX` hoặc `CompositeBitmapAnimation` dựa trên tên animation và các thông số.
  - **`CharacterNameVisual.js`**: Lớp hiển thị tên nhân vật theo phong cách isometric.
  - **`CompositeBitmapAnimation.js`**: Lớp cho phép kết hợp nhiều `BitmapAnimationX` thành một animation phức tạp hơn (ví dụ: nhân vật có nhiều lớp quần áo, tóc).
  - **`GameStatusBar.js`**: Lớp trực quan hóa thanh trạng thái game (điểm thiết kế, công nghệ, lỗi, tên game).
  - **`LevelOverlay.js`**: Lớp quản lý các đối tượng đồ họa phụ thuộc vào cấp độ văn phòng (ví dụ: máy lạnh, máy nước).
  - **`PointsDisplayVisual.js`**: Lớp trực quan hóa việc hiển thị điểm (có hình tròn và số).
  - **`ProgressBarVisual.js`**: Lớp trực quan hóa thanh tiến trình.
  - **`HypePointsVisual.js`**: Lớp hiển thị điểm hype.
  - **`CircularProgressVisual.js`**: Lớp hiển thị tiến trình dạng tròn (có thể dùng cho boost).
  - **`CharacterOverlay.js`**: Lớp chính quản lý việc hiển thị và animation của một nhân vật.
- **`ProjectWorkerVisual.js`**: Lớp trực quan hóa nhân viên làm việc trong các lab R&D hoặc Hardware.
- **`IsometricCompanyNameVisual.js`**: Lớp hiển thị tên công ty theo phong cách isometric trên văn phòng.
- **`VisualsManager.js`**: Module quản lý tổng thể việc hiển thị đồ họa và animation trong game. Điều phối việc vẽ lên canvas, tạo/xóa character overlays, quản lý vị trí nhân vật, hiệu ứng.
- **Quan hệ**: `VisualsManager` là module trung tâm, sử dụng `CanvasManager`, `GameResourceManager`, `AnimationSpriteSheets`, `BitmapAnimationFactory` và các lớp Visual khác để vẽ game. `GameManager` gọi `VisualsManager` để cập nhật hiển thị.

#### 2.9. `serializers/`

- **`TopicsSerializer.js`, `EnginePartsSerializer.js`, `EngineSerializer.js`, `FeatureSerializer.js`, `PlatformsSerializer.js`, `CompanyFeatureSerializer.js`, `SpawnedPointsSerializer.js`**: Mỗi file chứa logic để "serialize" (chuyển thành dạng lưu trữ được, thường là ID hoặc cấu trúc JSON đơn giản) và "deserialize" (khôi phục lại đối tượng đầy đủ từ dạng đã lưu) cho một loại đối tượng cụ thể trong game.
- **Quan hệ**: Được `GameManager` và `DataStore` sử dụng trong quá trình lưu và tải game.

---

## Tổng Quan

Game Dev Tycoon là một trò chơi mô phỏng kinh doanh, nơi người chơi thành lập và điều hành một công ty phát triển game. Trò chơi bao gồm các yếu tố quản lý tài chính, nhân sự, nghiên cứu công nghệ, phát triển sản phẩm, và tương tác với thị trường game ảo.

Mã nguồn được viết bằng JavaScript, sử dụng các thư viện như jQuery, EaselJS (cho đồ họa 2D), GreenSock (cho animation), và tích hợp với Steam API thông qua Greenworks cho các tính năng như Steam Cloud và Steam Workshop.

## Mô Tả Chi Tiết Các File/Module

### `defaultBrowser.html`

- **Mô tả**: Điểm khởi đầu của ứng dụng. Chịu trách nhiệm tải tất cả các tài nguyên CSS, thư viện JavaScript, và các module JavaScript của game theo thứ tự phụ thuộc. Nó cũng định nghĩa cấu trúc HTML cơ bản cho các thành phần giao diện người dùng.
- **Quan hệ**: Liên kết tất cả các thành phần lại với nhau và khởi chạy `GameManager`.

### Thư mục `compressed/`

#### `core/`

- **`GameFlags.js`**:
  - **Mô tả**: Định nghĩa các cờ và hằng số cấu hình gameplay (ví dụ: `TUTORIAL_DISABLED`, `SMALL_GAME_DURATION_FACTOR`).
  - **Quan hệ**: Được sử dụng bởi nhiều module để điều chỉnh hành vi game.
- **`CoreExtensions.js`**:
  - **Mô tả**: Mở rộng các đối tượng JavaScript gốc (`String`, `Number`, `Array`, `jQuery`) với các hàm tiện ích.
  - **Quan hệ**: Các hàm này được sử dụng rộng rãi trong toàn bộ code.
- **`Logger.js`**:
  - **Mô tả**: Hệ thống ghi log lỗi, cảnh báo, và thông tin. Có thể lưu log lỗi vào `DataStore`.
  - **Quan hệ**: Được gọi bởi các module khác để ghi nhận sự kiện.
- **`PlatformShim.js`**:
  - **Mô tả**: Lớp trừu tượng hóa các API đặc thù của nền tảng (Windows 8 Store, NW.js).
  - **Quan hệ**: Được sử dụng bởi `UI`, `GameManager`, `DataStore` để tương tác với hệ thống.

#### `reporting/`

- **`ErrorReporting.js`**:
  - **Mô tả**: Gửi báo cáo lỗi (hiện tại hàm `report` trống).
  - **Quan hệ**: Được gọi bởi `PlatformShim`.

#### `localization/`

- **`Localization.js`**:
  - **Mô tả**: Xử lý đa ngôn ngữ, chứa từ điển dịch và hàm `localize`.
  - **Quan hệ**: Được dùng bởi `LanguageMgr` và các module `UI`.

#### `game/GameManagerStates.js`

- **Mô tả**: Định nghĩa đối tượng `State` (enum) cho các trạng thái game.
- **Quan hệ**: Sử dụng bởi `GameManager`.

#### `game/GameManager.js`

- **Mô tả**: Module trung tâm, quản lý vòng lặp game, trạng thái, lưu/tải, các hành động chính trong game.
  - Bao gồm các logic con được mở rộng trong các IIFE như quản lý dự án R&D, Hardware Lab, và Contracts.
- **Quan hệ**: Tương tác với hầu hết các module khác.

#### `game/classes/`

- **`Booth.js`**: Lớp `Booth` (gian hàng hội chợ).
- **`Company.js`**: Lớp `Company` (công ty người chơi).
- **`Game.js`**: Lớp `Game` (tựa game).
- **`GameState.js`**: Các trạng thái của một tựa game.
- **`GameGenre.js`**: Các thể loại game và thuộc tính.
- **`Genre.js`**: Lớp cơ sở cho thể loại (ít dùng hơn `GameGenre`).
- **Quan hệ**: Được `GameManager` và các module logic sử dụng.

#### `game/logic/`

- **`GameTrends.js`**: Logic về xu hướng thị trường.
- **`Notification.js`**: Lớp `Notification` và các loại thông báo.
- **`SaveGameData.js`**: Cấu trúc dữ liệu tóm tắt file save.
- **`Character.js`**: Lớp `Character` (nhân viên), trạng thái và hướng.
- **`General.js`**: Các hàm tiện ích logic game chung.
- **Quan hệ**: Nền tảng logic cho gameplay.

#### `game/content/`

- **`Media.js`**: Tạo thông báo, tin tức dựa trên sự kiện.
- **`Missions.js`**: Định nghĩa nhiệm vụ, giai đoạn phát triển game.
- **`Platforms.js`**: Dữ liệu về các nền tảng game (PC, console).
- **`Topics.js`**: Định nghĩa chủ đề game.
- **Quan hệ**: Cung cấp dữ liệu nội dung cho game.

#### `game/mechanics/`

- **`Reviews.js`**: Logic tạo đánh giá game.
- **`Sales.js`**: Logic bán game, doanh thu.
- **`SalesEvents.js`**: Quản lý sự kiện đặc biệt về doanh số.
- **`DecisionNotifications.js`**: Thông báo yêu cầu quyết định từ người chơi.
- **`ProjectContracts.js`**: Logic hợp đồng gia công/phát hành.
- **Quan hệ**: Triển khai các cơ chế gameplay cốt lõi.

#### `game/utils/`

- **`LevelCalculator.js`**: Tính toán kinh nghiệm và cấp độ.
- **`SavegameMigrator.js`**: Nâng cấp file save cũ.
- **`SavegameConverter.js`**: Chuyển đổi định dạng file save (PC/Mobile).
- **Quan hệ**: Công cụ hỗ trợ cho `GameManager`, `DataStore`.

#### `platform/`

- **`SteamAPI.js`**: Tương tác với Steamworks API.
- **`SteamGreenworks.js`**: Tương tác Steam Workshop qua Greenworks.
- **Quan hệ**: Được `DataStore`, `UI` (mod panel), `GameManager` (achievements) sử dụng.

#### `system/`

- **`DataStore.js`**: Lưu/tải dữ liệu game (localStorage, Steam Cloud, Windows Roaming).
- **`LanguageManager.js`**: Quản lý ngôn ngữ game.
- **`ResourceKeys.js`**: Định danh và đường dẫn tài nguyên đồ họa.
- **`StartupAndSplash.js`**: Khởi động game, màn hình chờ, EULA.
- **`SoundManager.js`**: Quản lý âm thanh, nhạc nền (SoundJS).
- **`UpdateNotifications.js`**: Thông báo cập nhật game.
- **`SupportPacks.js`**: Gói hỗ trợ (IAP).
- **`ghg4.js`**: Analytics (Localytics).
- **`UpdateChecker.js`**: Kiểm tra cập nhật (bản không phải Steam).
- **Quan hệ**: Các module nền tảng hệ thống của game.

#### `ui/CustomAlert.js`

- **Mô tả**: Tạo hộp thoại thông báo tùy chỉnh.
- **Quan hệ**: Sử dụng bởi `Logger`.

#### `ui/UIManager.js` (và các file mở rộng UI trong `codeNw.js`)

- **Mô tả**: Quản lý giao diện người dùng chính: dialog, panel, sự kiện click, thanh trạng thái, menu.
- **Quan hệ**: Tương tác với `GameManager`, `Sound`.

#### `ui/elements/`

- **`SettingsGameplay.js`**: Quản lý cài đặt gameplay (tutorial, animation).
- **`FlippingCounter.js`**: Hiệu ứng số đếm lật.
- **`Knowledge.js`**: Quản lý "kiến thức" người chơi.
- **Quan hệ**: Được `UI` sử dụng. `Knowledge` tương tác với `GameManager`, `DataStore`.

#### `visuals/`

- **`CanvasManager.js`**: Khởi tạo và quản lý canvas HTML5.
- **`GameResourceManager.js`**: Tải và truy cập tài nguyên đồ họa.
- **`animations/`**: Chứa các lớp và dữ liệu cho animation của nhân vật và các đối tượng khác (`SpriteSheetX`, `AnimationSpriteSheets`, `BitmapAnimationFactory`, `CharacterOverlay`, v.v.).
- **`ProjectWorkerVisual.js`**: Hiển thị nhân viên làm việc trong lab.
- **`IsometricCompanyNameVisual.js`**: Hiển thị tên công ty isometric.
- **`VisualsManager.js`**: Module quản lý tổng thể việc hiển thị đồ họa và animation.
- **Quan hệ**: `VisualsManager` là trung tâm, sử dụng các module con để vẽ game.

#### `serializers/`

- **`TopicsSerializer.js`, `EnginePartsSerializer.js`, etc.**:
  - **Mô tả**: Chuyển đổi đối tượng game sang/từ dạng JSON để lưu trữ.
  - **Quan hệ**: Được `GameManager`, `DataStore` sử dụng khi lưu/tải game.

## Luồng Dữ Liệu và Kiến Trúc Tổng Thể (Sơ bộ)

1.  **Khởi tạo (`StartupAndSplash.js`, `defaultBrowser.html`)**:

    - HTML tải tất cả CSS, thư viện và các module JS.
    - `StartupAndSplash.js` hiển thị màn hình chờ.
    - `LanguageMgr.js` thiết lập ngôn ngữ.
    - `Sound.js` khởi tạo âm thanh.
    - `CanvasManager.js` thiết lập canvas.
    - `GameResourceManager.js` bắt đầu tải tài nguyên cơ bản.

2.  **Bắt đầu Game (`GameManager.js`)**:

    - Người chơi chọn "New Game" hoặc "Continue".
    - `GameManager` tạo mới hoặc tải dữ liệu công ty (`Company.js`), game (`Game.js`) từ `DataStore.js`.
    - `VisualsManager.js` được gọi để vẽ trạng thái game ban đầu.
    - `UI.js` hiển thị các thông báo ban đầu.

3.  **Vòng Lặp Game (`GameManager.update`)**:

    - Cập nhật thời gian game.
    - `General.js` xử lý các sự kiện hàng tuần (trả lương, bán game).
    - `Character.js` cập nhật trạng thái nhân viên.
    - Nếu đang phát triển game:
      - `GameManager` cập nhật tiến trình, điểm design/tech/bug.
      - `Missions.js` được tham chiếu để tính điểm/thời gian.
      - `Knowledge.js` có thể được cập nhật/sử dụng.
    - `VisualsManager.js` cập nhật hiển thị (animation nhân vật, điểm số, thanh tiến trình).
    - `UI.js` hiển thị các thông báo/dialog mới (từ `Media.js`, `DecisionNotifications.js`).

4.  **Tương Tác Người Dùng (`UI.js`, các module UI con)**:

    - Người dùng click vào các nút, menu.
    - `UI.js` bắt sự kiện, gọi các hàm tương ứng trong `GameManager` (ví dụ: `GameManager.createNewGame()`, `GameManager.research()`).

5.  **Lưu/Tải Game (`GameManager.js`, `DataStore.js`, `serializers/`)**:

    - `GameManager.save()` thu thập dữ liệu từ các đối tượng game.
    - Các `Serializer` chuyển đối tượng thành JSON.
    - `DataStore.saveToSlotAsync()` lưu dữ liệu.
    - Quá trình tải game diễn ra ngược lại. `SavegameMigrator.js` xử lý file save cũ.

6.  **Kết Thúc Game**:
    - `GameManager` kiểm tra điều kiện kết thúc.
    - `Media.js` có thể tạo các thông báo kết thúc.
    - Điểm số được tính và lưu.

## Đa Ngôn Ngữ

Hệ thống đa ngôn ngữ được triển khai thông qua `Localization.js`. Các chuỗi văn bản trong HTML và JavaScript thường sử dụng placeholder dạng `ll:{KeyName}` hoặc gọi hàm `String.prototype.localize()`. Dữ liệu dịch được chứa trong `i18n/languages.js`.

## Modding

Sự tồn tại của `modSupport.js` và `SteamGreenworks.js` (tích hợp Steam Workshop) cho thấy game có hỗ trợ modding. Cấu trúc module hóa của code có thể giúp việc tạo mod dễ dàng hơn bằng cách cho phép các modder ghi đè hoặc mở rộng các module hiện có.

## Lưu Ý Khi Phân Tích

- **Thứ tự tải script trong `defaultBrowser.html`** là một chỉ dẫn quan trọng về sự phụ thuộc giữa các module. Module được tải sau có thể phụ thuộc vào module tải trước.
- **Biến toàn cục**: Nhiều module được khai báo dưới dạng biến toàn cục (ví dụ: `GameManager`, `UI`, `VisualsManager`), cho phép các module khác dễ dàng truy cập.
- **IIFE (Immediately Invoked Function Expression)**: Một số module hoặc phần mở rộng của module được gói trong IIFE để tạo scope riêng và tránh xung đột biến.

Đây là một phân tích chi tiết dựa trên cấu trúc và nội dung của các file bạn cung cấp. Hy vọng nó sẽ giúp bạn hiểu rõ hơn về mã nguồn của Game Dev Tycoon!
