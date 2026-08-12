import React, { useState } from 'react';
import './AmenitySelector.css';

const categories = {
  Essentials: [
    'Wi-Fi',
    'TV',
    'Air conditioning',
    'Heating',
    'Dedicated workspace',
    'Indoor fireplace',
  ],

  'Kitchen & Dining': [
    'Kitchen',
    'Refrigerator',
    'Microwave',
    'Oven',
    'Stove',
    'Dishwasher',
    'Coffee maker',
    'Toaster',
    'Dishes and silverware',
    'Breakfast',
  ],

  'Bed & Bath': [
    'Bed linens',
    'Towels',
    'Hair dryer',
    'Shampoo',
    'Body soap',
    'Hot water',
    'Extra pillows and blankets',
    'Room-darkening shades',
  ],

  'Laundry & Cleaning': [
    'Washing machine',
    'Dryer',
    'Iron',
    'Hangers',
    'Cleaning products',
  ],

  'Facilities & Outdoor': [
    'Free parking',
    'Swimming pool',
    'Hot tub',
    'Gym',
    'Balcony',
    'Garden',
    'Patio',
    'Elevator',
    'EV charger',
    'BBQ grill',
  ],

  'Safety & Security': [
    'Smoke alarm',
    'Carbon monoxide alarm',
    'Fire extinguisher',
    'First aid kit',
    'Security',
    'Smart lock',
    'Safe',
  ],

  'Family & Special': [
    'Pet friendly',
    'Crib',
    'High chair',
  ],
};

function AmenitySelector({
  amenities,
  selectedAmenities,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState('Essentials');

  const toggleAmenity = (id) => {
    const numericId = Number(id);

    if (selectedAmenities.includes(numericId)) {
      onChange(
        selectedAmenities.filter(
          (item) => item !== numericId
        )
      );
    } else {
      onChange([
        ...selectedAmenities,
        numericId,
      ]);
    }
  };

  const getCategoryAmenities = (category) => {
    const names = categories[category];

    return amenities.filter((amenity) =>
      names.includes(amenity.name)
    );
  };

  const selectedCount = selectedAmenities.length;

  return (
    <>
      <div className="amenity-selector">
        <div className="amenity-selector-header">
          <div>
            <label>Amenities</label>

            <p>
              Select the amenities available at your
              property.
            </p>
          </div>

          <button
            type="button"
            className="select-amenities-btn"
            onClick={() => setIsOpen(true)}
          >
            Select amenities
          </button>
        </div>

        {selectedCount > 0 && (
          <div className="selected-amenities-preview">
            {amenities
              .filter((amenity) =>
                selectedAmenities.includes(
                  Number(amenity.id)
                )
              )
              .map((amenity) => (
                <span
                  key={amenity.id}
                  className="selected-amenity"
                >
                  {amenity.name}
                </span>
              ))}
          </div>
        )}

        {selectedCount === 0 && (
          <p className="no-amenities">
            No amenities selected yet.
          </p>
        )}
      </div>

      {isOpen && (
        <div
          className="amenity-modal-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="amenity-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="amenity-modal-header">
              <h2>Select amenities</h2>

              <button
                type="button"
                className="close-modal"
                onClick={() =>
                  setIsOpen(false)
                }
              >
                ×
              </button>
            </div>

            <div className="amenity-modal-body">
              <aside className="amenity-categories">
                {Object.keys(categories).map(
                  (category) => (
                    <button
                      type="button"
                      key={category}
                      className={
                        activeCategory === category
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        setActiveCategory(
                          category
                        )
                      }
                    >
                      {category}
                    </button>
                  )
                )}
              </aside>

              <section className="amenity-options">
                <h3>{activeCategory}</h3>

                <div className="amenity-options-grid">
                  {getCategoryAmenities(
                    activeCategory
                  ).map((amenity) => {
                    const selected =
                      selectedAmenities.includes(
                        Number(amenity.id)
                      );

                    return (
                      <button
                        type="button"
                        key={amenity.id}
                        className={`amenity-option ${
                          selected
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          toggleAmenity(
                            amenity.id
                          )
                        }
                      >
                        <span>
                          {amenity.name}
                        </span>

                        {selected && (
                          <span className="check">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="amenity-modal-footer">
              <span>
                {selectedCount} amenities selected
              </span>

              <button
                type="button"
                className="done-btn"
                onClick={() =>
                  setIsOpen(false)
                }
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AmenitySelector;