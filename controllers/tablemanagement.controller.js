const Table = require("../models/table.model");

class TableController {
  // Render the form to add a new table
  async addForm(req, res) {
    try {
      res.render("table/add", {
        title: "Table Management",
      });
    } catch (error) {
      console.error("Table add form error", error);
      res.status(500).send("Error rendering add table form");
    }
  }

  // Add a new table
  async add(req, res) {
    const { tableNumber, seatCount, status } = req.body;

    try {
      // Check if all required fields are provided
      if (!tableNumber || !seatCount) {
        return res.status(400).json({
          message: "Table number and seat count are required.",
        });
      }

      // Check for existing table with the same table number
      const existingTable = await Table.findOne({ tableNumber });
      if (existingTable) {
        return res.status(400).json({
          message: `Table number ${tableNumber} already exists. You can update this table.`,
        });
      }

      // Validate status
      const validStatuses = [
        "available",
        "new",
        "wait",
        "served",
        "delivered",
      ];
      const tableStatus = validStatuses.includes(status) ? status : "available"; // Default to "available" if status is invalid

      // Create a new table
      const table = await Table.create({
        tableNumber,
        seatCount,
        status: tableStatus,
      });

      // Redirect to the table list or send a success response
      res.redirect("/api/table/list");
    } catch (error) {
      console.error("Error adding table:", error.message);
      res.status(500).send("Error adding table");
    }
  }

  // async add(req, res) {
  //   const { tableNumber, seatCount, status } = req.body;
  //   try {
  //     // Check if all required fields are provided
  //     if (!tableNumber || !seatCount) {
  //       return res.status(400).json({
  //         message: "Table number and seat count are required.",
  //       });
  //     }

  //     const existingTable = await Table.findOne({ tableNumber });
  //     if (existingTable) {
  //       return res.status(400).json({
  //         message: `Table number ${tableNumber} already exists. You can update this table.`,
  //       });
  //     }

  //     const table = await Table.create({
  //       tableNumber,
  //       seatCount,
  //       status: status === "booked" ? "booked" : "available",
  //     });

  //     res.redirect("/api/table/list");
  //   } catch (error) {
  //     console.error("Table add error", error);
  //     res.status(500).send("Error adding table");
  //   }
  // }

  // List all tables
  async list(req, res) {
    try {
      const tables = await Table.find();
      res.render("table/list", {
        title: "Table List",
        tables,
      });
    } catch (error) {
      console.error("Error fetching tables", error);
      res.status(500).send("Error fetching tables");
    }
  }

  // Render edit form for a specific table
  async editForm(req, res) {
    const { id } = req.params;
    try {
      const table = await Table.findById(id);
      if (!table) {
        return res.status(404).send("Table not found");
      }
      res.render("table/update", {
        title: "Edit Table",
        table,
      });
    } catch (error) {
      console.error("Error fetching table", error);
      res.status(500).send("Error fetching table");
    }
  }

  // Handle table update
  async update(req, res) {
    const { id } = req.params;
    const { tableNumber, seatCount, status } = req.body;

    try {
      // Validate required fields
      if (!tableNumber || !seatCount) {
        return res.status(400).json({
          message: "Table number and seat count are required.",
        });
      }

      // Find the table by ID
      const table = await Table.findById(id);
      if (!table) {
        return res.status(404).send("Table not found");
      }

      // Update the table properties
      table.tableNumber = tableNumber;
      table.seatCount = seatCount;

      // Validate and update status
      const validStatuses = ["available", "new", "wait", "served", "delivered"];
      if (status && validStatuses.includes(status)) {
        table.status = status;
      } else {
        table.status = "available"; // Default if status is not valid
      }

      // Save the updated table
      await table.save();

      // Respond with the updated table data
      res.redirect("/api/table/list");
    } catch (error) {
      console.error("Error updating table:", error.message);
      res.status(500).send("Error updating table");
    }
  }

  // async update(req, res) {
  //   const { id } = req.params;
  //   const { tableNumber, seatCount, status } = req.body;
  //   try {
  //     if (!tableNumber || !seatCount) {
  //       return res.status(400).json({
  //         message: "Table number and seat count are required.",
  //       });
  //     }

  //     const table = await Table.findById(id);
  //     if (!table) {
  //       return res.status(404).send("Table not found");
  //     }

  //     table.tableNumber = tableNumber;
  //     table.seatCount = seatCount;
  //     table.status = status === "booked" ? "booked" : "available";

  //     await table.save();
  //     res.redirect("/api/table/list");
  //   } catch (error) {
  //     console.error("Error updating table", error);
  //     res.status(500).send("Error updating table");
  //   }
  // }

  // Soft delete a table by updating status
  async delete(req, res) {
    const { id } = req.params;
    try {
      const table = await Table.findById(id);
      if (!table) {
        return res.status(404).send("Table not found");
      }

      table.status = "deleted";
      await table.save();
      res.redirect("/api/table/list");
    } catch (error) {
      console.error("Error deleting table", error);
      res.status(500).send("Error deleting table");
    }
  }
}

module.exports = new TableController();
