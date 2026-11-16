"use client";

import React from "react";

const FontShowcase = () => {
        return (
                <div className="p-8 max-w-4xl mx-auto bg-white-1 shadow-lg rounded-lg">
                        <h1 className="text-3xl font-bold mb-6 text-center font-dmSerif text-black-1">
                                Font Showcase - Beautiful Typography
                        </h1>

                        <div className="grid gap-8">
                                <div className="border-b pb-4">
                                        <h2 className="text-xl font-semibold mb-2 font-playfair text-black-2">
                                                Playfair Display
                                        </h2>
                                        <p className="font-playfair text-lg">
                                                This elegant serif font is perfect for headings, quotes, and anywhere you want to add a touch of sophistication.
                                        </p>
                                        <p className="font-playfair italic mt-2">
                                                <span className="font-bold">Bold, </span>
                                                <span className="font-normal">normal, </span>
                                                <span className="italic">and italic variations add versatility.</span>
                                        </p>
                                </div>

                                <div className="border-b pb-4">
                                        <h2 className="text-xl font-semibold mb-2 font-montserrat text-black-2">
                                                Montserrat
                                        </h2>
                                        <p className="font-montserrat text-lg">
                                                A modern, geometric sans-serif font with clean lines and balanced proportions. Excellent for interfaces and body text.
                                        </p>
                                        <p className="font-montserrat mt-2">
                                                <span className="font-bold">Bold text stands out, </span>
                                                <span className="font-normal">while normal text maintains readability.</span>
                                        </p>
                                </div>

                                <div className="border-b pb-4">
                                        <h2 className="text-xl font-semibold mb-2 font-poppins text-black-2">
                                                Poppins
                                        </h2>
                                        <p className="font-poppins text-lg">
                                                A friendly, geometric sans-serif font that works beautifully for both headings and body text. Its rounded forms give it a warm feel.
                                        </p>
                                        <p className="font-poppins mt-2">
                                                <span className="font-bold">Bold, </span>
                                                <span className="font-medium">medium, </span>
                                                <span className="font-normal">and regular weights </span>
                                                <span className="font-light">plus light options </span>
                                                <span>make it highly versatile.</span>
                                        </p>
                                </div>

                                <div className="border-b pb-4">
                                        <h2 className="text-xl font-semibold mb-2 font-dmSerif text-black-2">
                                                DM Serif Display
                                        </h2>
                                        <p className="font-dmSerif text-lg">
                                                A high-contrast serif typeface with dramatic thick/thin transitions, perfect for headlines and display text.
                                        </p>
                                        <p className="font-dmSerif mt-2">
                                                This font adds a premium, editorial quality to your designs.
                                        </p>
                                </div>

                                <div className="pb-4">
                                        <h2 className="text-xl font-semibold mb-2 font-robotoSlab text-black-2">
                                                Roboto Slab
                                        </h2>
                                        <p className="font-robotoSlab text-lg">
                                                A slab serif version of the popular Roboto family, combining geometric forms with friendly, open curves.
                                        </p>
                                        <p className="font-robotoSlab mt-2">
                                                Perfect for subheadings and where you want readability with character.
                                        </p>
                                </div>
                        </div>

                        <div className="mt-8 p-6 bg-gray-1 rounded-lg">
                                <h3 className="font-dmSerif text-2xl mb-4">Font Combinations</h3>

                                <div className="mb-6">
                                        <h4 className="font-playfair text-xl mb-2">Heading in Playfair Display</h4>
                                        <p className="font-montserrat">Body text in Montserrat creates an elegant contrast with serif headings.</p>
                                </div>

                                <div className="mb-6">
                                        <h4 className="font-dmSerif text-xl mb-2">Heading in DM Serif Display</h4>
                                        <p className="font-poppins">Paired with Poppins for body text gives a modern yet refined feel.</p>
                                </div>

                                <div className="mb-6">
                                        <h4 className="font-robotoSlab text-xl mb-2">Heading in Roboto Slab</h4>
                                        <p className="font-montserrat">With Montserrat body text for a strong, contemporary look.</p>
                                </div>
                        </div>

                        <div className="curved-shape"></div>
                </div>
        );
};

export default FontShowcase; 