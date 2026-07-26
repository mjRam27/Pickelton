import "./page.css";
import Link from "next/link";

export default function AddCourtPage() {
  return (
    <div className="add-court-page">
      <div className="page-header">
        <div>
          <span className="page-tag">ADD COURT</span>
          <h1>Add New Court 🎾</h1>
          <p>Create a new pickleball court.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="court-form">
          <div className="form-group">
            <label>Court Name</label>
            <input type="text" placeholder="Court 1" />
          </div>

          <div className="form-group">
            <label>Court Type</label>
            <select>
              <option>Indoor</option>
              <option>Outdoor</option>
            </select>
          </div>

          <div className="form-group">
            <label>Surface</label>
            <select>
              <option>Wooden</option>
              <option>Acrylic</option>
              <option>Synthetic</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price / Hour</label>
            <input type="number" placeholder="500" />
          </div>

          <div className="form-group full">
            <label>Description</label>
            <textarea
              rows={5}
              placeholder="Describe this court..."
            ></textarea>
          </div>

          <div className="form-actions">
            <Link href="/partner/courts" className="secondary-btn">
              Cancel
            </Link>

            <button className="primary-btn">
              Save Court
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}