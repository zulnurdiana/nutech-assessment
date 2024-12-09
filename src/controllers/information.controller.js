import { response } from "../utils/response.js";
import db from "../utils/db.js";

export const getAllBanner = async (req, res) => {
  try {
    const banners = await db.query("SELECT * FROM banner");

    if (!banners) {
      response(res, 404, 0, "Banner Not Found", null);
    }

    const result = banners.rows;

    const filter = result.map((data) => {
      return {
        banner_name: data.banner_name,
        banner_image: data.banner_image,
        description: data.description,
      };
    });

    response(res, 200, 0, "Sukses", filter);
  } catch (error) {
    res.status(500).json({ message: "Error get all banners", error });
  }
};

export const getAllService = async (req, res) => {
  try {
    const query = "SELECT * FROM services";
    const services = await db.query(query);
    const result = services.rows;
    if (!result) {
      response(res, 404, 0, "Banner Not Found", null);
    }
    const filter = result.map((data) => {
      return {
        service_code: data.service_code,
        service_name: data.service_name,
        service_icon: data.service_icon,
        service_tariff: data.service_tariff,
      };
    });
    response(res, 200, 0, "Sukses", filter);
  } catch (error) {
    res.status(500).json({ message: "Error get all services", error });
  }
};
