"use strict";

// Định nghĩa đối tượng GameGenre chứa thông tin về các thể loại game
// và các hàm tiện ích liên quan.
var GameGenre = {
    // Định nghĩa các hằng số cho từng thể loại game, bao gồm id và tên đã được bản địa hóa.
    Action: {
        id: "Action",
        name: "Action".localize("genre") // "Action" là một thể loại game
    },
    Adventure: {
        id: "Adventure",
        name: "Adventure".localize("genre") // "Adventure" là một thể loại game
    },
    RPG: {
        id: "RPG",
        name: "RPG".localize("genre") // "RPG" là một thể loại game
    },
    Simulation: {
        id: "Simulation",
        name: "Simulation".localize("genre") // "Simulation" là một thể loại game
    },
    Strategy: {
        id: "Strategy",
        name: "Strategy".localize("genre") // "Strategy" là một thể loại game
    },
    Casual: {
        id: "Casual",
        name: "Casual".localize("genre") // "Casual" là một thể loại game
    },

    /**
     * Trả về một mảng chứa tất cả các đối tượng thể loại game đã định nghĩa.
     * @returns {Array<Object>} Mảng các đối tượng thể loại.
     */
    getAll: function () {
        return [this.Action, this.Adventure, this.RPG, this.Simulation, this.Strategy, this.Casual];
    },

    /**
     * Tính toán "tỷ lệ vàng" (Golden Ratio) dựa trên một hoặc hai thể loại game.
     * Tỷ lệ này có thể được sử dụng để đánh giá sự cân bằng hoặc phù hợp
     * giữa thiết kế và công nghệ trong game.
     * @param {Object} primaryGenre - Đối tượng thể loại game chính.
     * @param {Object} [secondaryGenre] - (Tùy chọn) Đối tượng thể loại game phụ.
     * @returns {number} Tỷ lệ vàng được tính toán.
     * @throws {string} Nếu thể loại không xác định.
     */
    getGoldenRatio: function (primaryGenre, secondaryGenre) {
        // Nếu có thể loại phụ, tính tỷ lệ trung bình có trọng số
        // (thể loại chính chiếm 2 phần, thể loại phụ chiếm 1 phần).
        if (secondaryGenre) {
            return (2 * GameGenre.getGoldenRatio(primaryGenre) + GameGenre.getGoldenRatio(secondaryGenre)) / 3;
        }
        // Trả về tỷ lệ vàng cố định cho từng thể loại chính.
        if (primaryGenre === GameGenre.Action) return 1.8;
        if (primaryGenre === GameGenre.Adventure) return 0.4;
        if (primaryGenre === GameGenre.RPG) return 0.6;
        if (primaryGenre === GameGenre.Simulation) return 1.6;
        if (primaryGenre === GameGenre.Strategy) return 1.4;
        if (primaryGenre === GameGenre.Casual) return 0.5;
        // Ném lỗi nếu thể loại không được hỗ trợ.
        throw "unknown genre: " + primaryGenre;
    },

    /**
     * Lấy hệ số phù hợp của một topic với một hoặc hai thể loại game.
     * @param {Array<number>} genreWeightingsArray - Mảng chứa các hệ số phù hợp của topic với các thể loại game (theo thứ tự trong getAll()).
     * @param {Object} primaryGenre - Đối tượng thể loại game chính.
     * @param {Object} [secondaryGenre] - (Tùy chọn) Đối tượng thể loại game phụ.
     * @returns {number} Hệ số phù hợp.
     * @throws {string} Nếu thể loại không xác định.
     */
    getGenreWeighting: function (genreWeightingsArray, primaryGenre, secondaryGenre) {
        // Nếu không có mảng hệ số (ví dụ: game chưa có topic), trả về 1 (trung lập).
        if (void 0 === genreWeightingsArray) return 1;

        // Nếu có thể loại phụ, tính hệ số trung bình có trọng số
        // (thể loại chính chiếm 2 phần, thể loại phụ chiếm 1 phần).
        if (secondaryGenre) {
            return (GameGenre.getGenreWeighting(genreWeightingsArray, secondaryGenre) + 2 * GameGenre.getGenreWeighting(genreWeightingsArray, primaryGenre)) / 3;
        }

        // Trả về hệ số phù hợp từ mảng dựa trên thể loại chính.
        if (primaryGenre === GameGenre.Action) return genreWeightingsArray[0];
        if (primaryGenre === GameGenre.Adventure) return genreWeightingsArray[1];
        if (primaryGenre === GameGenre.RPG) return genreWeightingsArray[2];
        if (primaryGenre === GameGenre.Simulation) return genreWeightingsArray[3];
        if (primaryGenre === GameGenre.Strategy) return genreWeightingsArray[4];
        if (primaryGenre === GameGenre.Casual) return genreWeightingsArray[5];
        // Ném lỗi nếu thể loại không được hỗ trợ.
        throw "unknown genre: " + primaryGenre;
    },

    /**
     * Lấy chỉ số (index) của một đối tượng thể loại game trong mảng trả về bởi getAll().
     * @param {Object} genreObject - Đối tượng thể loại game cần tìm chỉ số.
     * @returns {number} Chỉ số của thể loại trong mảng, hoặc -1 nếu không tìm thấy.
     */
    getIndexOf: function (genreObject) {
        // Tìm đối tượng thể loại trong mảng getAll() dựa trên id.
        // Giả định rằng Array.prototype.first đã được thêm vào từ file chính.
        var foundGenre = GameGenre.getAll().first(function (genreToCompare) {
            return genreToCompare.id == genreObject.id;
        });
        // Trả về chỉ số của đối tượng tìm được.
        return GameGenre.getAll().indexOf(foundGenre);
    }
};